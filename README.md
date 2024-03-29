# Next.js Disease Finder

This is a simple application built with Next.js to find diseases based on symptoms.

Clone the repository:

   ```
   git clone https://github.com/tejasundeep/nextjs-disease-finder.git
   ```
Install dependencies:

    cd nextjs-disease-finder
    npm install

Run the development server:
   ```
    npm run dev
    Open http://localhost:3000 in your browser.
   ```

Features

    Enter symptoms (comma-separated) to find matching diseases.
    Calculates match percentage based on input symptoms and disease symptoms.
    Displays matched diseases along with their match percentage.

Technologies Used

    Next.js
    React
    useState Hook

How it Works

    Enter symptoms separated by commas.
    Click on "Find Disease" button.
    The application calculates the match percentage of each disease based on the input symptoms.
    Matched diseases with non-zero match percentages are displayed.

File Structure

   ```
   ├── pages
   │   ├── data.json
   │   └── index.js
   ├── .gitignore
   ├── README.md
   ├── package.json
   └── package-lock.json
```


Author

    Teja Sundeep
    GitHub: tejasundeep
