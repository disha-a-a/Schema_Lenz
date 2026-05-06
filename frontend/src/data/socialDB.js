// src/data/socialDB.js
export const Users = [
  { user_id: "U1", name: "Arjun", email: "arjun@mail.com", city: "Bangalore", join_date: "2022-01-10" },
  { user_id: "U2", name: "Divya", email: "divya@mail.com", city: "Mumbai", join_date: "2022-03-15" },
  { user_id: "U3", name: "Karan", email: "karan@mail.com", city: "Delhi", join_date: "2021-11-20" },
  { user_id: "U4", name: "Priya", email: "priya@mail.com", city: "Bangalore", join_date: "2023-02-01" },
  { user_id: "U5", name: "Rohan", email: "rohan@mail.com", city: "Hyderabad", join_date: "2022-07-08" }
];

export const Posts = [
  { post_id: "P1", user_id: "U1", content: "Morning run done 🏃", likes: 142, created_at: "2024-01-01" },
  { post_id: "P2", user_id: "U2", content: "New café in Bandra!", likes: 89, created_at: "2024-01-02" },
  { post_id: "P3", user_id: "U1", content: "Anyone else love rain?", likes: 201, created_at: "2024-01-03" },
  { post_id: "P4", user_id: "U3", content: "Delhi winters hit diff", likes: 310, created_at: "2024-01-04" },
  { post_id: "P5", user_id: "U4", content: "First post here!", likes: 45, created_at: "2024-01-05" }
];

export const Comments = [
  { comment_id: "C1", post_id: "P1", user_id: "U2", text: "Same here!", created_at: "2024-01-01" },
  { comment_id: "C2", post_id: "P1", user_id: "U3", text: "Goals 💪", created_at: "2024-01-01" },
  { comment_id: "C3", post_id: "P3", user_id: "U4", text: "Yes always!", created_at: "2024-01-03" },
  { comment_id: "C4", post_id: "P4", user_id: "U1", text: "Facts", created_at: "2024-01-04" }
];

export const Follows = [
  { follower_id: "U2", followee_id: "U1", since: "2022-02-01" },
  { follower_id: "U3", followee_id: "U1", since: "2022-02-05" },
  { follower_id: "U4", followee_id: "U2", since: "2022-03-10" },
  { follower_id: "U1", followee_id: "U4", since: "2022-04-12" },
  { follower_id: "U5", followee_id: "U3", since: "2022-05-20" }
];

export const Hashtags = [
  { tag_id: "T1", tag_name: "fitness" },
  { tag_id: "T2", tag_name: "food" },
  { tag_id: "T3", tag_name: "travel" },
  { tag_id: "T4", tag_name: "tech" },
  { tag_id: "T5", tag_name: "weather" }
];

export const PostTags = [
  { post_id: "P1", tag_id: "T1" },
  { post_id: "P2", tag_id: "T2" },
  { post_id: "P3", tag_id: "T5" },
  { post_id: "P4", tag_id: "T5" },
  { post_id: "P5", tag_id: "T4" }
];

// Unnormalized Universal Relation for Demo
export const Social_Universal_Flat_File = [
  { 
    user_id: "U1", name: "Arjun", email: "arjun@mail.com", city: "Bangalore", 
    post_id: "P1", content: "Morning run done 🏃", likes: 142, p_created_at: "2024-01-01",
    comment_id: "C1", c_text: "Same here!", c_created_at: "2024-01-01",
    tag_id: "T1", tag_name: "fitness"
  },
  { 
    user_id: "U1", name: "Arjun", email: "arjun@mail.com", city: "Bangalore", 
    post_id: "P1", content: "Morning run done 🏃", likes: 142, p_created_at: "2024-01-01",
    comment_id: "C2", c_text: "Goals 💪", c_created_at: "2024-01-01",
    tag_id: "T1", tag_name: "fitness"
  },
  { 
    user_id: "U2", name: "Divya", email: "divya@mail.com", city: "Mumbai", 
    post_id: "P2", content: "New café in Bandra!", likes: 89, p_created_at: "2024-01-02",
    comment_id: null, c_text: null, c_created_at: null,
    tag_id: "T2", tag_name: "food"
  },
  { 
    user_id: "U3", name: "Karan", email: "karan@mail.com", city: "Delhi", 
    post_id: "P4", content: "Delhi winters hit diff", likes: 310, p_created_at: "2024-01-04",
    comment_id: "C4", c_text: "Facts", c_created_at: "2024-01-04",
    tag_id: "T5", tag_name: "weather"
  }
];
