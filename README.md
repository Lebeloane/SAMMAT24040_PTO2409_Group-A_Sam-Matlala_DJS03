Breaking the code into components was very confusing at first

I had all my code in one big file, and it worked. But when I tried to split it into smaller parts (like book list, details, and form), it was hard to figure out where each piece should go and how to connect them.

Figuring out how to make each part reusable
I wanted my components to be reusable, but it wasn’t easy to decide what to keep inside each function and what to pass as a parameter. I had to think more carefully about what each component should do.

Making sure components talk to each other
After splitting the code, I had to make sure all the parts worked together. For example, if someone clicked on a book, the detail component needed to update. This meant passing data between components and keeping everything in sync.

Organizing files and folders properly
I also had to learn how to name and organize files so that everything made sense. Otherwise, it quickly became messy and hard to find things.

Not breaking the app while refactoring
Every time I moved code to a separate file, there was a chance it could break.and at some point it did

