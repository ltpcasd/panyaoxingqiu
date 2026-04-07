-- ============================================================
-- 潘瑶星球数据库初始化脚本
-- 版本：1.0.0
-- 创建时间：2024
-- ============================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `panyaoxingqiu` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `panyaoxingqiu`;

-- -----------------------------------------------------------
-- 用户表
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `openid` VARCHAR(64) NOT NULL COMMENT '微信OpenID',
  `unionid` VARCHAR(64) DEFAULT NULL COMMENT '微信UnionID',
  `nickname` VARCHAR(64) DEFAULT NULL COMMENT '昵称',
  `avatar_url` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `gender` TINYINT DEFAULT 0 COMMENT '性别 0-未知 1-男 2-女',
  `country` VARCHAR(32) DEFAULT NULL COMMENT '国家',
  `province` VARCHAR(32) DEFAULT NULL COMMENT '省份',
  `city` VARCHAR(32) DEFAULT NULL COMMENT '城市',
  `language` VARCHAR(16) DEFAULT 'zh_CN' COMMENT '语言',
  `status` TINYINT DEFAULT 1 COMMENT '状态 0-禁用 1-正常',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_openid` (`openid`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- -----------------------------------------------------------
-- 用户设置表
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_settings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '设置ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `notification_enabled` TINYINT DEFAULT 1 COMMENT '是否开启通知 0-否 1-是',
  `sound_enabled` TINYINT DEFAULT 1 COMMENT '是否开启声音 0-否 1-是',
  `vibration_enabled` TINYINT DEFAULT 1 COMMENT '是否开启震动 0-否 1-是',
  `privacy_level` TINYINT DEFAULT 0 COMMENT '隐私等级 0-公开 1-仅伴侣可见 2-私密',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_user_settings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户设置表';

-- -----------------------------------------------------------
-- 情侣配对表
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `couples` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '配对ID',
  `user_id1` BIGINT UNSIGNED NOT NULL COMMENT '用户1 ID',
  `user_id2` BIGINT UNSIGNED NOT NULL COMMENT '用户2 ID',
  `pair_code` VARCHAR(8) NOT NULL COMMENT '配对码',
  `anniversary_date` DATE DEFAULT NULL COMMENT '纪念日',
  `couple_avatar` VARCHAR(255) DEFAULT NULL COMMENT '双人头像',
  `background_image` VARCHAR(255) DEFAULT NULL COMMENT '背景图',
  `intimacy_score` INT DEFAULT 0 COMMENT '亲密度分数',
  `level` INT DEFAULT 1 COMMENT '等级',
  `level_title` VARCHAR(32) DEFAULT '新手恋人' COMMENT '等级称号',
  `status` TINYINT DEFAULT 1 COMMENT '状态 0-解除 1-配对中',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_pair_code` (`pair_code`),
  KEY `idx_user1` (`user_id1`),
  KEY `idx_user2` (`user_id2`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_couples_user1` FOREIGN KEY (`user_id1`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_couples_user2` FOREIGN KEY (`user_id2`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='情侣配对表';

-- -----------------------------------------------------------
-- 时光轴表
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `timeline` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `couple_id` BIGINT UNSIGNED NOT NULL COMMENT '配对ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '发布用户ID',
  `content` TEXT NOT NULL COMMENT '内容',
  `images` JSON DEFAULT NULL COMMENT '图片列表',
  `location` VARCHAR(128) DEFAULT NULL COMMENT '位置',
  `event_date` DATE NOT NULL COMMENT '事件日期',
  `is_milestone` TINYINT DEFAULT 0 COMMENT '是否里程碑 0-否 1-是',
  `likes` INT DEFAULT 0 COMMENT '点赞数',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_couple_id` (`couple_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_event_date` (`event_date`),
  CONSTRAINT `fk_timeline_couple` FOREIGN KEY (`couple_id`) REFERENCES `couples` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_timeline_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='时光轴表';

-- -----------------------------------------------------------
-- 相册表
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `albums` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '照片ID',
  `couple_id` BIGINT UNSIGNED NOT NULL COMMENT '配对ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '上传用户ID',
  `image_url` VARCHAR(255) NOT NULL COMMENT '图片URL',
  `thumbnail_url` VARCHAR(255) DEFAULT NULL COMMENT '缩略图URL',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '描述',
  `tags` JSON DEFAULT NULL COMMENT '标签列表',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_couple_id` (`couple_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_albums_couple` FOREIGN KEY (`couple_id`) REFERENCES `couples` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_albums_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='相册表';

-- -----------------------------------------------------------
-- 默契考验题目表
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `quiz_questions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '题目ID',
  `content` VARCHAR(255) NOT NULL COMMENT '题目内容',
  `options` JSON NOT NULL COMMENT '选项列表',
  `category` VARCHAR(32) DEFAULT 'general' COMMENT '分类',
  `difficulty` TINYINT DEFAULT 1 COMMENT '难度 1-简单 2-中等 3-困难',
  `is_active` TINYINT DEFAULT 1 COMMENT '是否启用 0-否 1-是',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='默契考验题目表';

-- -----------------------------------------------------------
-- 默契考验答题记录表
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `quiz_answers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '答题ID',
  `couple_id` BIGINT UNSIGNED NOT NULL COMMENT '配对ID',
  `question_id` BIGINT UNSIGNED NOT NULL COMMENT '题目ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '答题用户ID',
  `answer` INT NOT NULL COMMENT '答案索引',
  `is_correct` TINYINT DEFAULT NULL COMMENT '是否匹配 0-否 1-是',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_couple_id` (`couple_id`),
  KEY `idx_question_id` (`question_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_quiz_answers_couple` FOREIGN KEY (`couple_id`) REFERENCES `couples` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_quiz_answers_question` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_quiz_answers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='默契考验答题记录表';

-- -----------------------------------------------------------
-- 任务表
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tasks` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '任务ID',
  `couple_id` BIGINT UNSIGNED NOT NULL COMMENT '配对ID',
  `title` VARCHAR(128) NOT NULL COMMENT '任务标题',
  `description` TEXT DEFAULT NULL COMMENT '任务描述',
  `type` VARCHAR(32) DEFAULT 'daily' COMMENT '类型 daily-weekly-monthly-special',
  `points` INT DEFAULT 10 COMMENT '完成积分',
  `assigned_to` BIGINT UNSIGNED DEFAULT NULL COMMENT '指派用户ID',
  `completed_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '完成用户ID',
  `status` TINYINT DEFAULT 0 COMMENT '状态 0-待完成 1-已完成 2-已过期',
  `due_date` DATE DEFAULT NULL COMMENT '截止日期',
  `completed_at` DATETIME DEFAULT NULL COMMENT '完成时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_couple_id` (`couple_id`),
  KEY `idx_status` (`status`),
  KEY `idx_due_date` (`due_date`),
  CONSTRAINT `fk_tasks_couple` FOREIGN KEY (`couple_id`) REFERENCES `couples` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务表';

-- -----------------------------------------------------------
-- 情书信箱表
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `messages` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '信件ID',
  `couple_id` BIGINT UNSIGNED NOT NULL COMMENT '配对ID',
  `sender_id` BIGINT UNSIGNED NOT NULL COMMENT '发送者ID',
  `receiver_id` BIGINT UNSIGNED NOT NULL COMMENT '接收者ID',
  `content` TEXT NOT NULL COMMENT '信件内容',
  `images` JSON DEFAULT NULL COMMENT '图片列表',
  `is_read` TINYINT DEFAULT 0 COMMENT '是否已读 0-否 1-是',
  `read_at` DATETIME DEFAULT NULL COMMENT '阅读时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_couple_id` (`couple_id`),
  KEY `idx_sender` (`sender_id`),
  KEY `idx_receiver` (`receiver_id`),
  KEY `idx_is_read` (`is_read`),
  CONSTRAINT `fk_messages_couple` FOREIGN KEY (`couple_id`) REFERENCES `couples` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_messages_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='情书信箱表';

-- -----------------------------------------------------------
-- 通知表
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '通知ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `type` VARCHAR(32) NOT NULL COMMENT '通知类型',
  `title` VARCHAR(128) NOT NULL COMMENT '标题',
  `content` TEXT DEFAULT NULL COMMENT '内容',
  `data` JSON DEFAULT NULL COMMENT '附加数据',
  `is_read` TINYINT DEFAULT 0 COMMENT '是否已读 0-否 1-是',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表';

-- -----------------------------------------------------------
-- 迁移记录表
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `timestamp` BIGINT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `executed_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='迁移记录表';

-- ============================================================
-- 初始化数据
-- ============================================================

-- 插入一些默认的默契考验题目
INSERT INTO `quiz_questions` (`content`, `options`, `category`, `difficulty`) VALUES
('对方最喜欢的颜色是？', '["红色", "蓝色", "绿色", "黄色"]', 'preference', 1),
('对方最喜欢吃什么口味？', '["甜的", "辣的", "咸的", "酸的"]', 'preference', 1),
('对方最喜欢的季节是？', '["春天", "夏天", "秋天", "冬天"]', 'preference', 1),
('对方最想去哪里旅行？', '["海边", "山区", "城市", "乡村"]', 'preference', 2),
('对方最害怕什么？', '["蜘蛛", "蛇", "高处", "黑暗"]', 'preference', 2);

-- 完成
SELECT '数据库初始化完成！' AS 'Result';
