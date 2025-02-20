---
title: "ROS tips about callbacks"
date: 2024-11-22
tags: 
    - ros
    - robotics
---

# ROS tips about callbacks

## Use additional callback queues
Sometimes you have a very important message that you do want to process it as fast as possible.

```cpp
ros::NodeHandle nh;
ros::CallbackQueue cq;
nh.setCallbackQueue(&cq);
ros::Subscriber sub = nh.subscribe("msg", 1, 
    [&](const std_msgs::String::ConstPtr &msg){});
ros::spin();
```
Usually, if you do not set an additional callback queue, ROS will set a global callback queue for every message you subscribe in your node. This can be disrupting for your application if you have some VIP messages need to process.

## Leave heavy tasks out of callbacks
Callbacks are executed when messages come to a node. If one callback has to be processed with a long time (and assuming you are using a global callback queue), then with great possibility that your other messages will be stuck. My practice for callbacks is that I will let the callbacks always perform copy tasks and leave the main logic in main loop or some worker threads.

## Thread safety
ROS guarantees that callbacks are thread safe. However, a user-customized thread is not thread safe with a ROS callback. That is, if there are read-and-write operations performed at the same time in the two threads, you may need to add locks or mutexes.