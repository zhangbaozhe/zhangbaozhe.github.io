---
title: "Optimization: Notes on L-BFGS"
date: 2025-06-21
tags:
    - trajectory optimization
    - robotics
    - optimization
---

# Optimization: Notes on L-BFGS

[[toc]]

## Background 

### Gradient descent 

Gradient descent (GD) is one of the most popular optimization methods used in 
machine learning community. 
The idea behind it is simple. 
At each update $k+1$, suppose we are already have the last update $x_k$ and we know the current gradient
at $x_k$ as $\nabla f(x_k)$ where $f$ is some function that we want to find its
minimum.
We can get to the next state by doing 
$$
  x_{k+1} \leftarrow x_k + \alpha * (-\nabla f(x_k)),
$$
where $\alpha$ is the step size.
The general update rule is 
<a id="eq-update"></a>
$$
  \tag{1}
  x_{k+1} \leftarrow x_k + \alpha_k * d_k,
$$
where $\alpha_k$ can be a constant or an adaptive parameter generated from some 
line search operation, and $d_k$ is the **descent direction** which can be the 
negative gradient $-\nabla f(x_k)$ or some other direction that could be better than
plain $-\nabla f(x_k)$.

If the objective function $f$ is convex, the global optimum can be guaranteed by 
using a small fixed step size $\alpha$. 
However this property depends on the nature of the objective function. 

### Newton method

Using GD can waste many iterations because gradient is a local first-order view
of $f$.
Newton method is a better approach. 
Suppose the function can be approximated at $x_k$, 
<a id="eq-taylor"></a>
$$
  \tag{2}
  f(x_k + d) \approx f(x_k) + \left[\nabla f(x_k) \right]^\top d + \frac{1}{2} d^\top \nabla^2 f(x_k) d.
$$
[Eq. (2)](#eq-taylor) shows that what is the approximated value at $x_k + d$. 
The motivation of Newton method is if we can make this approximated value low 
enough with respect to $d$, we can get a better direction.
Notice that the approximated term is a quadratic term w.r.t. $d$ and the gradient 
is 
$$
  \nabla f(x_k) + \nabla^2 f(x_k) d.
$$
By the first order condition we can get the minimum at 
<a id="eq-newton-direction"></a>
$$
  \tag{3}
  d = \left[
    \nabla^2 f(x_k)
  \right]^{-1} \nabla f(x_k).
$$
By applying this direction in [Eq. (1)](#eq-update) we can have lower iteration 
numbers.

Newton method can produce better descent direction.
However this comes with a price of evaluating the Hessian $\nabla^2 f(x_k)$ and 
the inverse of it. When the dimension is high, this overhead cannot be skipped.

### Quasi-Newton methods

The Hessian evaluation and the inverse computation immediately raise a question: 
Can we somehow approximate the Hessian and bypass the computation of the inverse?
This is the motivation of Quasi-Newton methods, where we try to make the computation
of 
$$
  d_k = (B_k)^{-1} \nabla f(x_k)
$$
does not rely on **explicit** Hessian evaluation / inverse computation / even 
matrix-vector product ($B_k$ is the approximation of the Hessian).

Therefore for $B_k$ we have the following requirements:

1. $B_k$ is a good estimate of $\nabla^2 f(x_k)$;
2. $B_k$'s computation should be cheap instead of evaluating dense Hessian $\nabla^2 f(x_k)$

If we consider the Quasi-Newton methods only use gradient evaluation for $B_k$.
By Taylor's theorem, 
$$
\nabla f(y) - \nabla f(x) = \int_0^1 \nabla^2 f(x + t(y - x))(y -x )\mathrm{d}t, 
$$
and this is the core idea for approximating the Hessian.

## Conditions and requirements for Quasi-Newton methods

We formalize the notations of [Eq. (2)](#eq-taylor), 
<a id="eq-taylor-formal"></a>
$$
  \tag{4}
  f(x_k + d) \approx m_k(d) := f(x_k) + \left[\nabla f(x_k) \right]^\top d + \frac{1}{2} d^\top B_k  d.
$$
Note that $f(x_k) = m_k(0)$ and $\nabla f(x_k) = \nabla m_k(0)$.
We want to have the descent direction that is 
$$
  d_k = \arg \min m_k(d) = -B_k^{-1} \nabla f(x_k).
$$

### Secant equation

Assuming we already have $B_k$, then in the next iteration 
$$
  \tag{5}
  m_{k+1}(d) = f(x_{k+1}) + \left[\nabla f(x_{k+1}) \right]^\top d + \frac{1}{2} d^\top B_{k+1}  d, 
$$
and the gradient of it w.r.t. $d$ is 
$$
  \tag{6}
  \nabla m_{k+1}(d) = \nabla f(x_{k+1}) + B_{k+1} d.
$$
We wish to find some condition to let $m$ approximate $f$ better.
Recall that $x_{k+1} = x_k + \alpha_k * d_k$ and  
$
  \nabla m_{k+1}(-\alpha_k d_k) = \nabla f(x_{k+1}) - \alpha_k B_{k+1} d_k.
$
Let 
<a id="secant-equation-motivation"></a>
$$
  \tag{7}
  \begin{aligned}
    \nabla m_{k+1}(-\alpha_k d_k) &= \nabla f(x_{k+1}) - \alpha_k B_{k+1} d_k \\
    &= \nabla f(x_k).
  \end{aligned}
$$
The idea of [Eq. (7)](#secant-condition-motivation) is that when at $x_{k+1}$ if we go backwards
$-\alpha_k d_k$ that much from $x_{k+1}$ to $x_k$, we should let the gradient of the new approximation 
at $k+1$ agree with the gradient of $f$ at $x_k$.
Therefore, 
$$
  \alpha_k B_{k+1} d_k = \nabla f(x_{k+1}) - \nabla f(x_k).
$$
Define the displacement as $s_k := \alpha_k d_k = x_{k+1} - x_k$ and the change 
in gradients as $y_k := \nabla f(x_{k+1}) - \nabla f(x_k)$. The above can be 
written as 
<a id="secant-equation"></a>
$$
\tag{8}
B_{k+1} s_k = y_k
$$
which is the **secant equation**.

### Curvature condition

If $B_{k+1} \succ 0$ (positive definitive), then $s_k^\top B_{k+1} s_k = s_k^\top y_k > 0$ following [Eq. (8)](#secant-equation).
This is the curvature condition.
If $f$ is strongly convex, the curvature condition is true by definition since 
$$
 s_k^\top y_k = (\nabla f(x_{k+1}) - \nabla f(x_k))^\top (x_{k+1} - x_k) > 0.
$$

### Choosing $B_{k+1}$

We can have a compact optimization problem for the choice as 
$$
  \begin{aligned}
    &\min_{B} \quad &\lVert B - B_k \rVert \\
    &\text{s.t.} \quad &B = B^\top \\
    & & Bs_k = y_k.
  \end{aligned}
$$
For example, one can choose $B$ as $\bar G_k$, where $\bar G_k = \int_0^1 \nabla^2 f(x_k + t\alpha_k d_k) \mathrm{d} t$ 
is the average Hessian. 
This holds by Taylor's theorem, 
$$
  \int_0^1 \nabla^2 f(x_k + t (x_{k+1} - x_k)) (x_{k+1} - x_k) \mathrm{d} t = \nabla f(x_{k+1}) - \nabla f(x_k).
$$

## BFGS (Broyden-Fletcher-Goldfarb-Shanno) method

BFGS method tries to find $H_{k+1} = B_{k+1}^{-1}$ such that $H_{k+1} y_k = s_k$.
To find such $H$ we have this problem
$$
  \begin{aligned}
    &\min_{H} \quad &\lVert H - H_k \rVert_W \\
    &\text{s.t.} \quad &H = H^\top \\
    & & Hy_k = s_k, 
  \end{aligned}
$$
where $\lVert \cdot \rVert_W$ is the weighted Frobenius norm with weight matrix
$W = \bar G_k = \int_0^1 \nabla^2 f(x_k + ts_k) \mathrm{d} t$. 
And $H_{k+1}$ and $B_{k+1}$ are given in closed form
$$
  \tag{9}
  \begin{aligned}
    H_{k+1} &= \left(I - \frac{s_k y_k^\top}{s_k^\top y_k}\right) H_k \left(I - \frac {y_k s_k^\top}{s_k^\top y_k}\right) + \frac{s_k s_k^\top}{s_k^\top y_k}\\
    B_{k+1} &= B_k - \frac{B_k s_k s_k^\top B_k}{s_k^\top B_k s_k} + \frac{y_k y_k^\top}{y_k^\top y_k}.
  \end{aligned}
$$

## References

UW-Madison CS/ISyE/Math/Stat 726 Notes (Spring 2023)