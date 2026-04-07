# 静态资源目录

此目录用于存放小程序的静态资源文件。

## 目录结构

```
static/
├── tabbar/           # TabBar图标
│   ├── home.png
│   ├── home-active.png
│   ├── timeline.png
│   ├── timeline-active.png
│   ├── task.png
│   ├── task-active.png
│   ├── mailbox.png
│   ├── mailbox-active.png
│   ├── profile.png
│   └── profile-active.png
├── avatar/           # 默认头像
│   └── avatar-default.png
└── bg/               # 默认背景
    └── bg-default.png
```

## 图标规范

### TabBar图标
- 尺寸: 48x48px
- 格式: PNG
- 风格: 线性图标，选中状态使用主色

### 头像
- 尺寸: 200x200px
- 格式: PNG
- 风格: 圆形，简洁风格

### 背景图
- 尺寸: 750x400px
- 格式: JPG/PNG
- 风格: 浪漫、温馨

## 注意事项

1. 图片资源建议使用 CDN 加速
2. 图标使用 PNG 格式，支持透明背景
3. 照片使用 JPG 格式，压缩质量 80%
4. 小图标使用 WebP 格式（如支持）
