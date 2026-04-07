-- =============================================
-- 潘瑶星球 - 测试数据初始化脚本
-- =============================================
-- 用途：为联调测试准备初始数据
-- 使用方法：在MySQL中执行此脚本
-- =============================================

-- 使用数据库
USE panyaoxingqiu;

-- =============================================
-- 1. 清空现有数据（可选，谨慎使用）
-- =============================================
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE points_records;
-- TRUNCATE TABLE notifications;
-- TRUNCATE TABLE quiz_records;
-- TRUNCATE TABLE letters;
-- TRUNCATE TABLE user_tasks;
-- TRUNCATE TABLE tasks;
-- TRUNCATE TABLE photos;
-- TRUNCATE TABLE albums;
-- TRUNCATE TABLE timeline_events;
-- TRUNCATE TABLE couples;
-- TRUNCATE TABLE user_settings;
-- TRUNCATE TABLE users;
-- TRUNCATE TABLE quiz_questions;
-- SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- 2. 创建测试用户
-- =============================================

-- 用户A（测试用户1）
INSERT INTO users (id, openid, unionid, nickname, avatar, gender, birthday, bio, created_at, updated_at)
VALUES (
    UUID(),
    'test_openid_001',
    'test_unionid_001',
    '测试用户A',
    'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTK7rPEqO2S9A7p3zUmUg6g0u6RMvbQAJtJiaGEothGCb1Ww9iamVeHGz4YYbgfianfcCp6d8iczY0nTPg/132',
    1,
    '1995-03-15',
    '这是测试用户A的个性签名',
    NOW(),
    NOW()
);

-- 用户B（测试用户2）
INSERT INTO users (id, openid, unionid, nickname, avatar, gender, birthday, bio, created_at, updated_at)
VALUES (
    UUID(),
    'test_openid_002',
    'test_unionid_002',
    '测试用户B',
    'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTK7rPEqO2S9A7p3zUmUg6g0u6RMvbQAJtJiaGEothGCb1Ww9iamVeHGz4YYbgfianfcCp6d8iczY0nTPg/132',
    2,
    '1996-07-20',
    '这是测试用户B的个性签名',
    NOW(),
    NOW()
);

-- =============================================
-- 3. 创建测试配对
-- =============================================

-- 获取用户ID并创建配对
SET @user_a_id = (SELECT id FROM users WHERE openid = 'test_openid_001');
SET @user_b_id = (SELECT id FROM users WHERE openid = 'test_openid_002');

INSERT INTO couples (id, user1_id, user2_id, couple_name, anniversary_date, couple_avatar, background_image, pair_code, status, created_at, updated_at)
VALUES (
    UUID(),
    @user_a_id,
    @user_b_id,
    '甜蜜恋人',
    '2025-12-25',
    'https://via.placeholder.com/200x200?text=Couple',
    'https://via.placeholder.com/750x400?text=Background',
    NULL,
    'active',
    NOW(),
    NOW()
);

-- =============================================
-- 4. 创建用户设置
-- =============================================

INSERT INTO user_settings (id, user_id, notification_enabled, sound_enabled, vibration_enabled, theme, language, created_at, updated_at)
SELECT 
    UUID(),
    id,
    TRUE,
    TRUE,
    TRUE,
    'default',
    'zh-CN',
    NOW(),
    NOW()
FROM users
WHERE openid IN ('test_openid_001', 'test_openid_002');

-- =============================================
-- 5. 创建时光轴事件
-- =============================================

SET @couple_id = (SELECT id FROM couples WHERE couple_name = '甜蜜恋人');

INSERT INTO timeline_events (id, couple_id, title, description, event_date, event_type, is_important, reminder_enabled, reminder_days, created_by, created_at, updated_at)
VALUES 
(UUID(), @couple_id, '相识纪念日', '我们第一次见面的日子，那天阳光正好', '2025-12-25', 'anniversary', TRUE, TRUE, '7,1', @user_a_id, NOW(), NOW()),
(UUID(), @couple_id, '确定关系', '我们正式在一起啦！', '2026-01-01', 'milestone', TRUE, TRUE, '7,3,1', @user_a_id, NOW(), NOW()),
(UUID(), @couple_id, '第一次旅行', '我们的第一次旅行，去了美丽的三亚', '2026-02-14', 'travel', FALSE, FALSE, NULL, @user_b_id, NOW(), NOW()),
(UUID(), @couple_id, '情人节', '一起度过的第一个情人节', '2026-02-14', 'anniversary', TRUE, TRUE, '7,1', @user_a_id, NOW(), NOW());

-- =============================================
-- 6. 创建相册和照片
-- =============================================

-- 创建相册
INSERT INTO albums (id, couple_id, name, description, cover, photo_count, created_at, updated_at)
VALUES 
(UUID(), @couple_id, '我们的日常', '记录我们在一起的每一天', 'https://via.placeholder.com/300x300?text=Daily', 0, NOW(), NOW()),
(UUID(), @couple_id, '旅行回忆', '一起走过的路', 'https://via.placeholder.com/300x300?text=Travel', 0, NOW(), NOW());

-- 获取相册ID
SET @album_daily_id = (SELECT id FROM albums WHERE name = '我们的日常');
SET @album_travel_id = (SELECT id FROM albums WHERE name = '旅行回忆');

-- 添加照片
INSERT INTO photos (id, album_id, url, description, taken_at, uploaded_by, created_at)
VALUES 
(UUID(), @album_daily_id, 'https://via.placeholder.com/800x600?text=Photo1', '美好的一天', '2026-03-01 10:30:00', @user_a_id, NOW()),
(UUID(), @album_daily_id, 'https://via.placeholder.com/800x600?text=Photo2', '开心时刻', '2026-03-05 15:20:00', @user_b_id, NOW()),
(UUID(), @album_travel_id, 'https://via.placeholder.com/800x600?text=Photo3', '三亚之旅', '2026-02-14 09:00:00', @user_a_id, NOW());

-- 更新相册照片数
UPDATE albums SET photo_count = 2 WHERE id = @album_daily_id;
UPDATE albums SET photo_count = 1 WHERE id = @album_travel_id;

-- =============================================
-- 7. 创建任务
-- =============================================

INSERT INTO tasks (id, title, description, task_type, points, difficulty, icon, is_active, created_at, updated_at)
VALUES 
(UUID(), '发送一封信', '给TA写一封温暖的信', 'daily', 10, 'easy', '📧', TRUE, NOW(), NOW()),
(UUID(), '上传一张合照', '记录我们的美好瞬间', 'daily', 15, 'easy', '📷', TRUE, NOW(), NOW()),
(UUID(), '完成一次默契测试', '测试你们的默契程度', 'daily', 20, 'medium', '❤️', TRUE, NOW(), NOW()),
(UUID(), '纪念特殊日子', '添加一个纪念日到时光轴', 'weekly', 30, 'medium', '📅', TRUE, NOW(), NOW()),
(UUID(), '连续登录7天', '每天都来看看TA', 'weekly', 50, 'medium', '⭐', TRUE, NOW(), NOW());

-- =============================================
-- 8. 创建用户任务记录
-- =============================================

SET @task1_id = (SELECT id FROM tasks WHERE title = '发送一封信');
SET @task2_id = (SELECT id FROM tasks WHERE title = '上传一张合照');

INSERT INTO user_tasks (id, user_id, task_id, status, progress, completed_at, claimed_at, created_at, updated_at)
VALUES 
(UUID(), @user_a_id, @task1_id, 'pending', 0, NULL, NULL, NOW(), NOW()),
(UUID(), @user_a_id, @task2_id, 'pending', 0, NULL, NULL, NOW(), NOW()),
(UUID(), @user_b_id, @task1_id, 'pending', 0, NULL, NULL, NOW(), NOW());

-- =============================================
-- 9. 创建信件
-- =============================================

INSERT INTO letters (id, sender_id, receiver_id, title, content, letter_type, mood, is_read, read_at, created_at)
VALUES 
(UUID(), @user_a_id, @user_b_id, '写给亲爱的你', '亲爱的，今天又是想你的一天...', 'love', 'happy', FALSE, NULL, NOW()),
(UUID(), @user_b_id, @user_a_id, '早安问候', '早安，新的一天开始了，要开心哦！', 'greeting', 'happy', TRUE, NOW(), NOW());

-- =============================================
-- 10. 创建默契测试题目
-- =============================================

INSERT INTO quiz_questions (id, question, option_a, option_b, option_c, option_d, correct_answer, category, difficulty, created_at)
VALUES 
(UUID(), 'TA最喜欢的水果是什么？', '苹果', '香蕉', '草莓', '西瓜', 'C', 'preference', 'easy', NOW()),
(UUID(), 'TA的生日是几月几号？', '1月1日', '3月15日', '7月20日', '12月25日', 'C', 'personal', 'easy', NOW()),
(UUID(), 'TA最喜欢的颜色是什么？', '红色', '蓝色', '粉色', '绿色', 'B', 'preference', 'easy', NOW()),
(UUID(), '我们第一次见面是在哪里？', '咖啡厅', '图书馆', '公园', '商场', 'A', 'memory', 'medium', NOW()),
(UUID(), 'TA的梦想是什么？', '环游世界', '开一家小店', '成为作家', '其他', 'A', 'dream', 'hard', NOW());

-- =============================================
-- 11. 创建积分记录
-- =============================================

INSERT INTO points_records (id, user_id, points, type, description, created_at)
VALUES 
(UUID(), @user_a_id, 100, 'register', '注册奖励', NOW()),
(UUID(), @user_a_id, 10, 'task', '完成任务奖励', NOW()),
(UUID(), @user_b_id, 100, 'register', '注册奖励', NOW());

-- 更新用户积分
UPDATE users SET points = 110 WHERE openid = 'test_openid_001';
UPDATE users SET points = 100 WHERE openid = 'test_openid_002';

-- =============================================
-- 12. 创建通知
-- =============================================

INSERT INTO notifications (id, user_id, type, title, content, is_read, created_at)
VALUES 
(UUID(), @user_a_id, 'system', '欢迎来到潘瑶星球', '感谢您的使用，开启您的甜蜜之旅吧！', FALSE, NOW()),
(UUID(), @user_b_id, 'system', '欢迎来到潘瑶星球', '感谢您的使用，开启您的甜蜜之旅吧！', FALSE, NOW()),
(UUID(), @user_b_id, 'letter', '收到新信件', 'TA给你写了一封信，快去看看吧！', FALSE, NOW());

-- =============================================
-- 完成
-- =============================================

SELECT '✅ 测试数据初始化完成！' AS message;
SELECT COUNT(*) AS user_count FROM users;
SELECT COUNT(*) AS couple_count FROM couples;
SELECT COUNT(*) AS timeline_count FROM timeline_events;
SELECT COUNT(*) AS album_count FROM albums;
SELECT COUNT(*) AS task_count FROM tasks;
SELECT COUNT(*) AS letter_count FROM letters;
