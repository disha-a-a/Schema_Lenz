-- social_seed.sql
-- Users
INSERT INTO "user" (user_id, name, email, city, join_date) VALUES
('U1', 'Arjun', 'arjun@mail.com', 'Bangalore', '2022-01-10'),
('U2', 'Divya', 'divya@mail.com', 'Mumbai', '2022-03-15'),
('U3', 'Karan', 'karan@mail.com', 'Delhi', '2021-11-20'),
('U4', 'Priya', 'priya@mail.com', 'Bangalore', '2023-02-01'),
('U5', 'Rohan', 'rohan@mail.com', 'Hyderabad', '2022-07-08');

-- Posts
INSERT INTO post (post_id, user_id, content, likes, created_at) VALUES
('P1', 'U1', 'Morning run done 🏃', 142, '2024-01-01'),
('P2', 'U2', 'New café in Bandra!', 89, '2024-01-02'),
('P3', 'U1', 'Anyone else love rain?', 201, '2024-01-03'),
('P4', 'U3', 'Delhi winters hit diff', 310, '2024-01-04'),
('P5', 'U4', 'First post here!', 45, '2024-01-05');

-- Comments
INSERT INTO comment (comment_id, post_id, user_id, text, created_at) VALUES
('C1', 'P1', 'U2', 'Same here!', '2024-01-01'),
('C2', 'P1', 'U3', 'Goals 💪', '2024-01-01'),
('C3', 'P3', 'U4', 'Yes always!', '2024-01-03'),
('C4', 'P4', 'U1', 'Facts', '2024-01-04');

-- Follows (self‑referential)
INSERT INTO follow (follower_id, followee_id, since) VALUES
('U2', 'U1', '2022-02-01'),
('U3', 'U1', '2022-02-05'),
('U4', 'U2', '2022-03-10'),
('U1', 'U4', '2022-04-12'),
('U5', 'U3', '2022-05-20');

-- Hashtags
INSERT INTO hashtag (tag_id, tag_name) VALUES
('T1', 'fitness'),
('T2', 'food'),
('T3', 'travel'),
('T4', 'tech'),
('T5', 'weather');

-- PostTag linking table
INSERT INTO post_tag (post_id, tag_id) VALUES
('P1', 'T1'),
('P2', 'T2'),
('P3', 'T5'),
('P4', 'T5'),
('P5', 'T4');
