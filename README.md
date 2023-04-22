# BlogTask_Cito_Cab

Build a RESTful API for a blogging platform that allows users to create, read, update, and delete blog posts, and retrieve comments and authors associated with each blog post. The API should be built using Node.js and the Express framework.

The API should include the following endpoints:
1 GET /posts - Retrieve a list of all blog posts with their associated comments and authors
2 GET /posts/:id - Retrieve a specific blog post by ID with its associated comments and authors
3 POST /posts - Create a new blog post
4 PUT /posts/:id - Update an existing blog post by ID
5 DELETE /posts/:id - Delete an existing blog post by ID

Each blog post should include the following fields:
Title
Body
Author (foreign key to authors table)
Publication date
Tags (optional)
Each comment should include the following fields:
Text
Author (foreign key to authors table)
Each author should include the following fields:
Name
Email
To retrieve comments and authors associated with each blog post, you will need to use two joins. One join to retrieve comments associated with each blog post, and another join to retrieve the author associated with each comment.
