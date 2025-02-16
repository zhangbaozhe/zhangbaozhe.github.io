---
title: "Reading notes: C++ Concurrency in Action"
date: 2025-02-11
---

# Reading notes: C++ Concurrency in Action

[[toc]]

This book C++ Concurrency in Action by Anthony Williams is a great book about C++ multi-threading that I started reading a long time ago. Finally, I can write some reading notes about it. C++ multithreading programming is a huge pain for me as a robotics researcher and software engineer. All we robotics software engineers try to let the computing platform exploit its full potentials, e.g., let our algorithms run in parallel. However, parallelism comes with a price of mental stress, especially when you do programming in C++. In this blog post, I will record some of the key ideas from the book and add some coding examples.

## Shared data and race condition
Although the whole purpose of the multithreading programming is to enhance concurrency and data parallelism, programmers have to pay attention to the race condition of the shared data. For example, in the following code:

```cpp
int i = 0;
auto add = [&i] {
  for (size_t num = 0; num < 100; num++)
  i++;
};
std::thread t1(add); std::thread t2(add);
t1.join(); t2.join();
```
you launched two threads expecting the shared variable `i` to be 200, but it's not. Due to the memory order and cache coherency problem, when you expecting that `t1` adding 1 to the assumed latest `i`, that `i` in `t1` may not be the latest as the content in the memory is not updated. Besides, the above example is an undefined behavior in C++. So there's a race condition and we need synchronization or enforcing read-write order. There are two ways:

- Lock-based (easy, OS-level): using std::mutex related mutual exclusive on the critical part to let the code run in serial, i.e., when one thread acquiring the lock, other threads wait for it to be released (and begging they can acquire due to some magical scheduling method)
- Lock-free (hard, processor-level): making sure the reading and writing operations are in the expected order. The simplest method for the above example is to use `std::atomic<int>` which guarantees the memory order (see cppreference)
For general data structures in multithreading, the lock-based methods are usually easier to implement and make sure its correctness.

## Thread-safe lock-based data structures

> TL; DR: More (fine-grained) locks → more parallelism

When sharing data among threads, it might be easy to synchronize data with the type of int. However, if you have a stack or queue that want to be shared and you want to full control of the parallelism of these types. You may consider building your own thread-safe types. For these kind of big data, usually

> The smaller the protected region, the fewer operations are serialized, and the greater the potential for concurrency.

For example, if you use the STL queue and mutex,
```cpp
{ // thread 1
  std::lock_guard<std::mutex> lk(_mtx);
  queue.push(T);
}
{ // thread2
  std::lock_guard<std::mutex> lk(_mtx);
  queue.pop(T);
}
```
you are increasing the time of the serialization (or high contention), but actually the push and pop operations won't affect each other's data (e.g., head or tail). I'll copy some of the simple classic thread-safe containers in the appendix for reference. As for thread-safe queue, the cpp-channel library also provides a Go-like channel in C++.

## Example: Quick Sort
In the book, there are many examples about the sorting algorithm Quicksort. Basically about Quicksort, each time you select the first element of the input list as the pivot, then partition the rest of the list to two sub lists, one for which lower than the pivot and the other higher than or equal to the pivot. Recursively performing the same operations to the lower and higher ones. A sequential Quicksort could be implemented as the following:

```cpp
// From Listing 4.12
template <typename T> 
inline std::list<T> sequential_quick_sort(std::list<T> input) {
  if (input.empty()) {
    return input;
  }
  std::list<T> result;
  // move the 1st one from input to result as the pivot
  result.splice(result.begin(), input, input.begin());
  T const &pivot = *result.begin();
  // input is partitioned as '< pivot' and '>= pivot'
  auto divide_point = std::partition(input.begin(), input.end(),
                                      [&](T const &t) { return t < pivot; });
  std::list<T> lower_part;
  // move the [input.begin, divide point) to lower part
  lower_part.splice(lower_part.begin(), input, input.begin(), divide_point);
  auto new_lower = sequential_quick_sort(std::move(lower_part));
  auto new_higher = sequential_quick_sort(std::move(input));
  result.splice(result.end(), new_higher);
  result.splice(result.begin(), new_lower);
  return result;
}
```
For a parallel speedup, we sort the lower and higher in parallel. This could be achieved via `std::async` as it will either launch a new thread or stay in the thread based on the provided policy when the user want to get the result of the submitted task.

```cpp
// From Listing 4.13
template <typename T>
inline std::list<T> parallel_quick_sort(std::list<T> input) {
  if (input.empty()) {
    return input;
  }
  std::list<T> result;
  result.splice(result.begin(), input, input.begin());
  T const &pivot = *result.begin();
  auto divide_point = std::partition(input.begin(), input.end(),
                                     [&](T const &t) { return t < pivot; });
  std::list<T> lower_part;
  lower_part.splice(lower_part.begin(), input, input.begin(), divide_point);
 
  std::future<std::list<T>> new_lower(
      std::async(&parallel_quick_sort<T>, std::move(lower_part)));
 
  auto new_higher = parallel_quick_sort(std::move(input));
 
  result.splice(result.end(), new_higher);
  result.splice(result.begin(), new_lower.get());
 
  return result;
}
```
`std::async` launches a new thread or stay in the current thread to do the work. However, when the number of threads go up in this sorting task, the overhead of the thread itself goes up. Thus, we may need a way to mannually manage the number of threads and tasks submitting to those threads. This leads us to a common thread managment technique thread pool.

Basically for a thread pool, we create some number of threads in advance and submitting tasks (callables) to it. Only one thread handle one task at a time. To get the task be fetched, there need to be a queue-like sturcture to store the user-submitted task, and the threads can fetch these tasks (by dequeue). Here I want to show a very simple basic thread pool implementation:

```cpp
class ThreadPool {
public:
  explicit ThreadPool(size_t numThreads = std::thread::hardware_concurrency())
      : _tasks(), _stop(false) {
    // Start worker threads
    for (size_t i = 0; i < numThreads; ++i) {
      _workers.emplace_back([this] {
        while (!_stop) {
          run_pending_task();
        }
      });
    }
  }
 
  void run_pending_task() {
    std::shared_ptr<std::function<void()>> task_ptr = _tasks.try_pop();
    if (task_ptr) {
      (*task_ptr)();
    } else {
      std::this_thread::yield();
    }
  }
 
  ~ThreadPool() {
    _stop = true;
    // Join all worker threads
    for (std::thread &worker : _workers) {
      if (worker.joinable()) {
        worker.join();
      }
    }
  }
 
  // Submit a job to the thread pool with perfect forwarding
  template <typename Func, typename... Args>
  auto submit(Func &&func, Args &&...args)
      -> std::future<typename std::invoke_result_t<Func, Args...>> {
 
    using returnType = typename std::invoke_result_t<Func, Args...>;
 
    // Create a packaged task that will contain the job to be executed
    auto task = std::make_shared<std::packaged_task<returnType()>>(
        std::bind(std::forward<Func>(func), std::forward<Args>(args)...));
 
    std::future<returnType> future = task->get_future();
 
    // Push the task into the queue
    _tasks.push([task]() { (*task)(); });
 
    return future; // Return the future to the caller
  }
 
private:
  std::vector<std::thread> _workers;                // Worker threads
  thread_safe::Queue<std::function<void()>> _tasks; // Task queue need to be thread-safe
  std::atomic<bool> _stop;                          // Stop flag
};
```
Based on the thread pool, we can implement the Quicksort by submitting the partition job to the thread pool:

```cpp
template <typename T> struct QuickSorterThreadPool {
  ThreadPool pool;
 
  std::list<T> do_sort(std::list<T> &chunk_data) {
    if (chunk_data.empty()) {
      return chunk_data;
    }
    std::list<T> result;
    result.splice(result.begin(), chunk_data, chunk_data.begin());
    T const &partition_val = *result.begin();
    auto divide_point =
        std::partition(chunk_data.begin(), chunk_data.end(),
                       [&](T const &val) { return val < partition_val; });
    std::list<T> new_lower_chunk;
    new_lower_chunk.splice(new_lower_chunk.end(), chunk_data,
                           chunk_data.begin(), divide_point);
    std::future<std::list<T>> new_lower = pool.submit(
        &QuickSorterThreadPool<T>::do_sort, this, new_lower_chunk);
    std::list<T> new_higher(do_sort(chunk_data));
    result.splice(result.end(), new_higher);
    while (new_lower.wait_for(std::chrono::seconds(0)) ==
           std::future_status::timeout) {
      pool.run_pending_task();
    }
    result.splice(result.begin(), new_lower.get());
    return result;
  }
}; // strict QuickSorterThreadPool
 
template <typename T>
std::list<T> parallel_quick_sort_thread_pool(std::list<T> input) {
  if (input.empty()) {
    return input;
  }
  QuickSorterThreadPool<T> s;
  return s.do_sort(input);
}
```
## Conclusion and future work
Well, the blog post is far beyond complete on the multi-threading programming. Mainly, we talk about using mutex locks to create some thread-safe containers and use them for thread management (e.g., thread pool). However, I haven't looked much on the lock-free methods, as those are related to much lower level of memory orders. In the future maybe I can work on them.

So I think the most valuable takeaway for me reading this book is: More (fine-grained) locks → more parallelism. Locks are useful, but if you lock on a very big data structure, it slows your application down, because you let only one thread work while leaving others waiting (they actually can do some work like memory allocation, if there's no data race).

By the way, there are some good work in the community:

- [cpp-channel](https://github.com/andreiavrammsd/cpp-channel): this is a Go-like channel (or consumer-producer queue) in C++
- [concurrentqueue](https://github.com/cameron314/concurrentqueue): A fast multi-producer, multi-consumer lock-free concurrent queue for C++11
- [readerwriterqueue](https://github.com/cameron314/readerwriterqueue): A fast single-producer, single-consumer lock-free queue for C++

## Appendix: Thread-safe containers

### Thread-safe stack
```cpp
template <typename T> class Stack {
private:
  struct Node {
    std::shared_ptr<T> data;
    std::unique_ptr<Node> next;
  }; // struct Node
 
  std::unique_ptr<Node> _head;
  std::mutex _head_mutex;
 
  // Pop head function to remove the head node safely
  std::unique_ptr<Node> pop_head() {
    std::lock_guard<std::mutex> head_lock(_head_mutex);
    if (!_head) {
      return nullptr; // Stack is empty
    }
    std::unique_ptr<Node> old_head = std::move(_head);
    _head = std::move(old_head->next);
    return old_head;
  }
 
public:
  Stack() = default;
  Stack(const Stack &) = delete;
  Stack &operator=(const Stack &) = delete;
 
  // Function to pop an element from the stack
  std::shared_ptr<T> try_pop() {
    std::unique_ptr<Node> old_head = pop_head();
    return old_head ? old_head->data : std::shared_ptr<T>();
  }
 
  // Function to push an element onto the stack
  void push(T new_value) {
    std::shared_ptr<T> new_data(std::make_shared<T>(std::move(new_value)));
    std::unique_ptr<Node> new_node(new Node{new_data, nullptr});
 
    std::lock_guard<std::mutex> head_lock(_head_mutex);
    new_node->next = std::move(_head);
    _head = std::move(new_node);
  }
}; // class Stack
```
### Thread-safe queue
```cpp
template <typename T> class Queue {
private:
  struct Node {
    std::shared_ptr<T> data;
    std::unique_ptr<Node> next;
  }; // struct Node
  std::mutex _head_mutex;
  std::unique_ptr<Node> _head;
  std::mutex _tail_mutex;
  Node *_tail;
  std::condition_variable _data_cond;
 
  Node *get_tail() {
    std::lock_guard<std::mutex> tail_lock(_tail_mutex);
    return _tail;
  }
  std::unique_ptr<Node> pop_head() {
    std::unique_ptr<Node> old_head = std::move(_head);
    _head = std::move(old_head->next);
    return old_head;
  }
  std::unique_lock<std::mutex> wait_for_data() {
    std::unique_lock<std::mutex> head_lock(_head_mutex);
    _data_cond.wait(head_lock, [&] { return _head.get() != get_tail(); });
    return std::move(head_lock);
  }
  std::unique_ptr<Node> wait_pop_head() {
    std::unique_lock<std::mutex> head_lock(wait_for_data());
    return pop_head();
  }
  std::unique_ptr<Node> try_pop_head() {
    std::lock_guard<std::mutex> head_lock(_head_mutex);
    if (_head.get() == get_tail()) {
      return std::unique_ptr<Node>();
    }
    return pop_head();
  }
 
public:
  Queue() : _head(new Node), _tail(_head.get()) {}
  Queue(const Queue &) = delete;
  Queue &operator=(const Queue &) = delete;
 
  bool empty() {
    std::lock_guard<std::mutex> head_lock(_head_mutex);
    return (_head.get() == get_tail());
  }
  std::shared_ptr<T> try_pop() {
    std::unique_ptr<Node> old_head = try_pop_head();
    return old_head != nullptr ? old_head->data : std::shared_ptr<T>();
  }
  std::shared_ptr<T> wait_and_pop() {
    std::unique_ptr<Node> old_head = wait_pop_head();
    return old_head->data;
  }
  void push(T new_value) {
    std::shared_ptr<T> new_data(std::make_shared<T>(std::move(new_value)));
    std::unique_ptr<Node> p(new Node);
    Node *new_tail = p.get();
    {
      std::lock_guard<std::mutex> tail_lock(_tail_mutex);
      _tail->data = new_data;
      _tail->next = std::move(p);
      _tail = new_tail;
    }
    _data_cond.notify_one();
  }
};
```
### Thread-safe list
```cpp
template <typename T> class List {
 
  struct Node {
    std::mutex m;
    std::shared_ptr<T> data;
    std::unique_ptr<Node> next;
    Node() : next() {}
    Node(const T &value) : data(std::make_shared<T>(value)) {}
  }; // struct Node
 
  Node _head;
 
public:
  List() {}
  ~List() {
    remove_if([](const Node &) { return true; });
  }
  List(const List &) = delete;
  List &operator=(const List &) = delete;
 
  void push_front(const T &value) {
    std::unique_ptr<Node> new_node(new Node(value));
    std::lock_guard<std::mutex> lk(_head.m);
    new_node->next = std::move(_head.next);
    _head.next = std::move(new_node);
  }
  template <typename F> void for_each(F f) {
    Node *current = &_head;
    std::unique_lock<std::mutex> lk(_head.m);
    while (Node *const next = current->next.get()) {
      std::unique_lock<std::mutex> next_lk(next->m);
      lk.unlock();
      f(*next->data);
      current = next;
      lk = std::move(next_lk); // lk has bigger scope
    }
  }
  template <typename Pred> std::shared_ptr<T> find_first_if(Pred p) {
    Node *current = &_head;
    std::unique_lock<std::mutex> lk(_head.m);
    while (Node *const next = current->next.get()) {
      std::unique_lock<std::mutex> next_lk(next->m);
      lk.unlock();
      if (p(*next->data)) {
        return next->data;
      }
      current = next;
      lk = std::move(next_lk);
    }
    return std::shared_ptr<T>();
  }
  template <typename Pred> void remove_if(Pred p) {
    Node *current = &_head;
    std::unique_lock<std::mutex> lk(_head.m);
    while (Node *const next = current->next.get()) {
      std::unique_lock<std::mutex> next_lk(next->m);
      if (p(*next->data)) {
        std::unique_ptr<Node> old_next = std::move(current->next);
        current->next = std::move(next->next);
        next_lk.unlock();
      } else {
        lk.unlock();
        current = next;
        lk = std::move(next_lk);
      }
    }
  }
 
}; // class List
```
### Thread-safe map
```cpp
template <typename Key, typename Value, typename Hash = std::hash<Key>>
class Map {
private:
  class Bucket {
  private:
    using BucketValue = std::pair<Key, Value>;
    List<BucketValue> _data;
 
  public:
    Value value_for(const Key &key, const Value &default_value) {
      auto found_entry = _data.find_first_if(
          [&](const BucketValue &item) { return item.first == key; });
      return found_entry ? *found_entry : default_value;
    }
    void add_or_update_mapping(const Key &key, const Value &value) {
      auto found_entry = _data.find_first_if(
          [&](const BucketValue &item) { return item.first == key; });
      if (found_entry) {
        found_entry->second = value;
      } else {
        _data.push_front(BucketValue(key, value));
      }
    }
    void remove_mapping(const Key &key) {
      _data.remove_if(
          [&](const BucketValue &item) { return item.first == key; });
    }
  }; // class Bucket
  std::vector<std::unique_ptr<Bucket>> _buckets;
  Hash _hasher;
 
  Bucket &get_bucket(const Key &key) {
    const std::size_t bucket_index = _hasher(key) % _buckets.size();
    return *_buckets[bucket_index];
  }
 
public:
  using key_type = Key;
  using mapped_type = Value;
  using hash_type = Hash;
 
  Map(size_t num_buckets = 19, const Hash &hasher = Hash())
      : _buckets(num_buckets), _hasher(hasher) {
    for (size_t i = 0; i < num_buckets; ++i) {
      _buckets[i] = std::make_unique<Bucket>();
    }
  }
 
  Map(const Map &) = delete;
  Map &operator=(const Map &) = delete;
 
  Value value_for(const Key &key, const Value &default_value = Value()) const {
    return get_bucket(key).value_for(key, default_value);
  }
 
  void add_or_update_mapping(const Key &key, const Value &value) {
    get_bucket(key).add_or_update_mapping(key, value);
  }
 
  void remove_mapping(const Key &key) { get_bucket(key).remove_mapping(key); }
}; // class Map
```
There's a version that you can use the STL's list if you don't have a
thread-safe list.
```cpp
template <typename Key, typename Value, typename Hash = std::hash<Key>>
class _Map {
private:
  class Bucket {
  private:
    using BucketValue = std::pair<Key, Value>;
    using BucketData = std::list<BucketValue>; // uses STL list
    using BucketIterator = typename BucketData::iterator;
    BucketData _data;
    mutable std::shared_mutex _mutex;
 
    BucketIterator find_entry_for(const Key &key) {
      return std::find_if(
          _data.begin(), _data.end(),
          [&](const BucketValue &item) { return item.first == key; });
    }
 
  public:
    Value value_for(const Key &key, const Value &default_value) {
      std::shared_lock<std::shared_mutex> lock(_mutex);
      const BucketIterator found_entry = find_entry_for(key);
      return (found_entry == _data.end()) ? default_value : found_entry->second;
    }
    void add_or_update_mapping(const Key &key, const Value &value) {
      std::unique_lock<std::shared_mutex> lock(_mutex);
      const BucketIterator found_entry = find_entry_for(key);
      if (found_entry == _data.end()) {
        _data.push_back(BucketValue(key, value));
      } else {
        found_entry->second = value;
      }
    }
    void remove_mapping(const Key &key) {
      std::unique_lock<std::shared_mutex> lock(_mutex);
      const BucketIterator found_entry = find_entry_for(key);
      if (found_entry != _data.end()) {
        _data.erase(found_entry);
      }
    }
  }; // class Bucket
  std::vector<std::unique_ptr<Bucket>> _buckets;
  Hash _hasher;
  Bucket &get_bucket(const Key &key) const {
    const std::size_t bucket_index = _hasher(key) % _buckets.size();
    return *_buckets[bucket_index];
  }
 
public:
  using key_type = Key;
  using mapped_type = Value;
  using hash_type = Hash;
 
  _Map(size_t num_buckets = 19, const Hash &hasher = Hash())
      : _buckets(num_buckets), _hasher(hasher) {
    for (size_t i = 0; i < num_buckets; ++i) {
      _buckets[i].reset(new Bucket);
    }
  }
 
  _Map(const _Map &) = delete;
  _Map &operator=(const _Map &) = delete;
 
  Value value_for(const Key &key, const Value &default_value = Value()) const {
    return get_bucket(key).value_for(key, default_value);
  }
  void add_or_update_mapping(const Key &key, const Value &value) {
    get_bucket(key).add_or_update_mapping(key, value);
  }
  void remove_mapping(const Key &key) { get_bucket(key).remove_mapping(key); }
}; // class _Map
```