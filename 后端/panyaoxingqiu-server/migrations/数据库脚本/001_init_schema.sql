-- ============================================================
-- 潘瑶星球 数据库迁移脚本
-- 版本: v1.0.0
-- 数据库: MySQL 8.0
-- 字符集: utf8mb4
-- ============================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `panyaoxingqiu`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `panyaoxingqiu`;

-- ============================================================
-- 用户表
-- ============================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `openid`      VARCHAR(64)     NOT NULL COMMENT '微信openid',
  `unionid`     VARCHAR(64)     DEFAULT NULL COMMENT '微信unionid',
  `nickname`    VARCHAR(64)     DEFAULT NULL COMMENT '昵称',
  `avatar_url`  VARCHAR(512)    DEFAULT NULL COMMENT '头像URL',
  `gender`      TINYINT         DEFAULT 0 COMMENT '性别 0-未知 1-男 2-女',
  `country`     VARCHAR(64)     DEFAULT NULL,
  `province`    VARCHAR(64)     DEFAULT NULL,
  `city`        VARCHAR(64)     DEFAULT NULL,
  `language`    VARCHAR(32)     DEFAULT NULL,
  `status`      TINYINT         DEFAULT 1 COMMENT '状态 1-正常 0-禁用',
  `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`),
  KEY `idx_unionid` (`unionid`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================================
-- 用户设置表
-- ============================================================
CREATE TABLE IF NOT EXISTS `user_settings` (
  `id`                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`               BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `notify_letter`         TINYINT         DEFAULT 1 COMMENT '信件通知 0-关 1-开',
  `notify_anniversary`    TINYINT         DEFAULT 1 COMMENT '纪念日通知 0-关 1-开',
  `notify_task`           TINYINT         DEFAULT 1 COMMENT '任务提醒 0-关 1-开',
  `notify_quiz`           TINYINT         DEFAULT 1 COMMENT '默契题通知 0-关 1-开',
  `privacy_show_location` TINYINT         DEFAULT 1 COMMENT '显示位置 0-关 1-开',
  `created_at`            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`),
  CONSTRAINT `fk_user_settings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户设置表';

-- ============================================================
-- 配对关系表
-- ============================================================
CREATE TABLE IF NOT EXISTS `couples` (
  `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id1`          BIGINT UNSIGNED NOT NULL COMMENT '用户1 ID（配对发起者）',
  `user_id2`          BIGINT UNSIGNED DEFAULT NULL COMMENT '用户2 ID（配对接受者）',
  `pair_code`         VARCHAR(8)      DEFAULT NULL COMMENT '配对码（4位数字）',
  `couple_avatar`     VARCHAR(512)    DEFAULT NULL COMMENT '双人头像URL',
  `background_image`  VARCHAR(512)    DEFAULT NULL COMMENT '主页背景图',
  `anniversary_date`  DATE            DEFAULT NULL COMMENT '纪念日',
  `together_days`     INT             DEFAULT 0 COMMENT '在一起天数',
  `intimacy_score`    INT             DEFAULT 0 COMMENT '亲密度分数',
  `level`             TINYINT         DEFAULT 1 COMMENT '等级 1-15',
  `level_title`       VARCHAR(32)     DEFAULT '初识' COMMENT '等级称号',
  `status`            TINYINT         DEFAULT 0 COMMENT '状态 0-等待绑定 1-已绑定 2-已解除',
  `created_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_pair_code` (`pair_code`),
  KEY `idx_user_id1` (`user_id1`),
  KEY `idx_user_id2` (`user_id2`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_couples_user1` FOREIGN KEY (`user_id1`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_couples_user2` FOREIGN KEY (`user_id2`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='配对关系表';

-- ============================================================
-- 时光轴事件表
-- ============================================================
CREATE TABLE IF NOT EXISTS `timeline_events` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `couple_id`      BIGINT UNSIGNED NOT NULL COMMENT '配对ID',
  `creator_id`     BIGINT UNSIGNED NOT NULL COMMENT '创建者ID',
  `event_type`     TINYINT         NOT NULL COMMENT '事件类型 1-纪念日 2-日常 3-旅行',
  `title`          VARCHAR(128)    NOT NULL COMMENT '标题',
  `content`        TEXT            DEFAULT NULL COMMENT '内容',
  `event_date`     DATE            NOT NULL COMMENT '事件日期',
  `location`       VARCHAR(128)    DEFAULT NULL COMMENT '地点',
  `weather`        VARCHAR(32)     DEFAULT NULL COMMENT '天气',
  `mood`           VARCHAR(32)     DEFAULT NULL COMMENT '心情',
  `images`         JSON            DEFAULT NULL COMMENT '图片数组',
  `is_important`   TINYINT         DEFAULT 0 COMMENT '是否重要 0-否 1-是',
  `likes_count`    INT             DEFAULT 0 COMMENT '点赞数',
  `comments_count` INT             DEFAULT 0 COMMENT '评论数',
  `status`         TINYINT         DEFAULT 1 COMMENT '状态 1-正常 0-已删除',
  `created_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_couple_id` (`couple_id`),
  KEY `idx_event_date` (`event_date`),
  KEY `idx_creator_id` (`creator_id`),
  CONSTRAINT `fk_timeline_couple` FOREIGN KEY (`couple_id`) REFERENCES `couples` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_timeline_creator` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='时光轴事件表';

-- ============================================================
-- 相册表
-- ============================================================
CREATE TABLE IF NOT EXISTS `albums` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `couple_id`   BIGINT UNSIGNED NOT NULL COMMENT '配对ID',
  `creator_id`  BIGINT UNSIGNED NOT NULL COMMENT '创建者ID',
  `name`        VARCHAR(64)     NOT NULL COMMENT '相册名称',
  `description` VARCHAR(256)    DEFAULT NULL COMMENT '相册描述',
  `cover_image` VARCHAR(512)    DEFAULT NULL COMMENT '封面图片',
  `photo_count` INT             DEFAULT 0 COMMENT '照片数量',
  `status`      TINYINT         DEFAULT 1 COMMENT '状态 1-正常 0-已删除',
  `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_couple_id` (`couple_id`),
  CONSTRAINT `fk_albums_couple` FOREIGN KEY (`couple_id`) REFERENCES `couples` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='相册表';

-- ============================================================
-- 照片表
-- ============================================================
CREATE TABLE IF NOT EXISTS `photos` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `album_id`        BIGINT UNSIGNED NOT NULL COMMENT '相册ID',
  `couple_id`       BIGINT UNSIGNED NOT NULL COMMENT '配对ID',
  `uploader_id`     BIGINT UNSIGNED NOT NULL COMMENT '上传者ID',
  `original_url`    VARCHAR(512)    NOT NULL COMMENT '原图URL',
  `thumbnail_url`   VARCHAR(512)    DEFAULT NULL COMMENT '缩略图URL',
  `width`           INT             DEFAULT NULL COMMENT '图片宽度',
  `height`          INT             DEFAULT NULL COMMENT '图片高度',
  `size`            INT             DEFAULT NULL COMMENT '文件大小(字节)',
  `description`     VARCHAR(256)    DEFAULT NULL COMMENT '描述',
  `tags`            VARCHAR(512)    DEFAULT NULL COMMENT '标签(逗号分隔)',
  `taken_at`        DATETIME        DEFAULT NULL COMMENT '拍摄时间',
  `status`          TINYINT         DEFAULT 1 COMMENT '状态 1-正常 0-已删除',
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_album_id` (`album_id`),
  KEY `idx_couple_id` (`couple_id`),
  CONSTRAINT `fk_photos_album` FOREIGN KEY (`album_id`) REFERENCES `albums` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_photos_couple` FOREIGN KEY (`couple_id`) REFERENCES `couples` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='照片表';

-- ============================================================
-- 默契考验题目表
-- ============================================================
CREATE TABLE IF NOT EXISTS `quiz_questions` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category`       VARCHAR(64)     NOT NULL COMMENT '题目分类',
  `question`       VARCHAR(512)    NOT NULL COMMENT '题目内容',
  `option_a`       VARCHAR(128)    NOT NULL COMMENT '选项A',
  `option_b`       VARCHAR(128)    NOT NULL COMMENT '选项B',
  `option_c`       VARCHAR(128)    DEFAULT NULL COMMENT '选项C',
  `option_d`       VARCHAR(128)    DEFAULT NULL COMMENT '选项D',
  `correct_answer` CHAR(1)         NOT NULL COMMENT '正确答案 A/B/C/D',
  `explanation`    TEXT            DEFAULT NULL COMMENT '解析',
  `difficulty`     TINYINT         DEFAULT 1 COMMENT '难度 1-简单 2-中等 3-困难',
  `status`         TINYINT         DEFAULT 1 COMMENT '状态 1-正常 0-禁用',
  `created_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='默契考验题目表';

-- ============================================================
-- 默契考验记录表
-- ============================================================
CREATE TABLE IF NOT EXISTS `quiz_records` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `couple_id`    BIGINT UNSIGNED NOT NULL COMMENT '配对ID',
  `question_id`  BIGINT UNSIGNED NOT NULL COMMENT '题目ID',
  `user1_answer` CHAR(1)         DEFAULT NULL COMMENT '用户1的答案',
  `user2_answer` CHAR(1)         DEFAULT NULL COMMENT '用户2的答案',
  `is_match`     TINYINT         DEFAULT 0 COMMENT '是否默契 0-否 1-是',
  `score`        INT             DEFAULT 0 COMMENT '得分',
  `created_at`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_couple_question` (`couple_id`, `question_id`),
  KEY `idx_couple_id` (`couple_id`),
  CONSTRAINT `fk_quiz_records_couple` FOREIGN KEY (`couple_id`) REFERENCES `couples` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='默契考验记录表';

-- ============================================================
-- 任务表
-- ============================================================
CREATE TABLE IF NOT EXISTS `tasks` (
  `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title`            VARCHAR(128)    NOT NULL COMMENT '任务标题',
  `description`      TEXT            DEFAULT NULL COMMENT '任务描述',
  `task_type`        TINYINT         NOT NULL COMMENT '任务类型 1-日常 2-周任务 3-挑战',
  `icon`             VARCHAR(128)    DEFAULT NULL COMMENT '图标',
  `intimacy_reward`  INT             DEFAULT 15 COMMENT '亲密度奖励',
  `sort_order`       INT             DEFAULT 0 COMMENT '排序',
  `status`           TINYINT         DEFAULT 1 COMMENT '状态 1-正常 0-禁用',
  `created_at`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_task_type` (`task_type`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务表';

-- ============================================================
-- 用户任务记录表
-- ============================================================
CREATE TABLE IF NOT EXISTS `user_tasks` (
  `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`          BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `couple_id`        BIGINT UNSIGNED NOT NULL COMMENT '配对ID',
  `task_id`          BIGINT UNSIGNED NOT NULL COMMENT '任务ID',
  `status`           TINYINT         DEFAULT 0 COMMENT '状态 0-未完成 1-已完成',
  `progress`         INT             DEFAULT 0 COMMENT '当前进度',
  `target`           INT             DEFAULT 1 COMMENT '目标值',
  `intimacy_reward`  INT             DEFAULT 0 COMMENT '亲密度奖励',
  `task_date`        DATE            DEFAULT NULL COMMENT '任务日期',
  `completed_at`     DATETIME        DEFAULT NULL COMMENT '完成时间',
  `remark`           VARCHAR(256)    DEFAULT NULL COMMENT '完成备注',
  `proof_image`      VARCHAR(512)    DEFAULT NULL COMMENT '证明图片',
  `created_at`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_task_date` (`user_id`, `task_id`, `task_date`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_couple_id` (`couple_id`),
  KEY `idx_task_date` (`task_date`),
  CONSTRAINT `fk_user_tasks_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_tasks_couple` FOREIGN KEY (`couple_id`) REFERENCES `couples` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户任务记录表';

-- ============================================================
-- 信件表
-- ============================================================
CREATE TABLE IF NOT EXISTS `letters` (
  `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `couple_id`        BIGINT UNSIGNED NOT NULL COMMENT '配对ID',
  `sender_id`        BIGINT UNSIGNED NOT NULL COMMENT '发送者ID',
  `receiver_id`      BIGINT UNSIGNED NOT NULL COMMENT '接收者ID',
  `title`            VARCHAR(128)    DEFAULT NULL COMMENT '信件标题',
  `content`          TEXT            NOT NULL COMMENT '信件内容',
  `mood`             VARCHAR(32)     DEFAULT NULL COMMENT '心情标签',
  `background_style` VARCHAR(32)     DEFAULT 'default' COMMENT '信纸样式',
  `is_read`          TINYINT         DEFAULT 0 COMMENT '是否已读 0-未读 1-已读',
  `read_at`          TIMESTAMP       DEFAULT NULL COMMENT '阅读时间',
  `status`           TINYINT         DEFAULT 1 COMMENT '状态 1-正常 0-已删除',
  `created_at`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_couple_id` (`couple_id`),
  KEY `idx_sender_id` (`sender_id`),
  KEY `idx_receiver_id` (`receiver_id`),
  KEY `idx_is_read` (`is_read`),
  CONSTRAINT `fk_letters_couple` FOREIGN KEY (`couple_id`) REFERENCES `couples` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='信件表';

-- ============================================================
-- 通知表
-- ============================================================
CREATE TABLE IF NOT EXISTS `notifications` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`     BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `title`       VARCHAR(128)    NOT NULL COMMENT '通知标题',
  `content`     TEXT            NOT NULL COMMENT '通知内容',
  `notify_type` TINYINT         NOT NULL COMMENT '通知类型 1-系统 2-配对 3-互动 4-任务 5-纪念日',
  `extra_data`  TEXT            DEFAULT NULL COMMENT '额外数据(JSON)',
  `is_read`     TINYINT         DEFAULT 0 COMMENT '是否已读 0-未读 1-已读',
  `read_at`     TIMESTAMP       DEFAULT NULL COMMENT '阅读时间',
  `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_notify_type` (`notify_type`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表';

-- ============================================================
-- 积分记录表
-- ============================================================
CREATE TABLE IF NOT EXISTS `points_records` (
  `id`          VARCHAR(36)     NOT NULL COMMENT 'UUID',
  `user_id`     BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `points`      INT             NOT NULL COMMENT '积分变动值',
  `type`        VARCHAR(32)     NOT NULL COMMENT '类型: task-任务 quiz-默契题 checkin-签到 other-其他',
  `source_id`   VARCHAR(64)     DEFAULT NULL COMMENT '来源ID',
  `description` VARCHAR(256)    DEFAULT NULL COMMENT '描述',
  `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_points_records_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分记录表';
