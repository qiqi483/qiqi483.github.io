---
title: "我的第一个游戏：猜数字"
date: '2026-07-23T15:00:00+08:00'
draft: false
tags: ["Python", "小游戏"]
categories: ["Python"]
---

## 项目简介

一个简单的命令行猜数字游戏，适合 Python 初学者练习。

## 玩法

计算机随机生成 1-100 之间的数字，玩家通过提示逐步猜出正确数字。

## 源码

```python
import random

def guess_number():
    target = random.randint(1, 100)
    attempts = 0
    
    print("欢迎来到猜数字游戏！")
    print("我已经想好了一个 1-100 之间的数字。")
    
    while True:
        guess = int(input("请输入你的猜测: "))
        attempts += 1
        
        if guess < target:
            print("太小了，再大一点！")
        elif guess > target:
            print("太大了，再小一点！")
        else:
            print(f"恭喜你猜对了！你一共猜了 {attempts} 次。")
            break

if __name__ == "__main__":
    guess_number()
```

## 运行方式

```bash
python guess_number.py
```