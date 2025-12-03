# Flow | Radical Generosity

A boundless ecosystem where resources flow freely from those who have to those who need. No friction. No shame. Just flow.

## Core Features

*   **Universal Need**: A distraction-free way to ask for help without categories.
*   **Effortless Give**: Snap a photo to list an item in seconds.
*   **Radical Trust**: Community-driven support powered by Supabase.

## Tech Stack

*   **Framework**: Next.js 14 (App Router)
*   **Styling**: Tailwind CSS v4 + Framer Motion
*   **Database**: Supabase (PostgreSQL)
*   **Storage**: Supabase Storage
*   **Auth**: Supabase Auth (Magic Links)

## Getting Started

1.  **Clone & Install**
    ```bash
    npm install
    ```

2.  **Environment Setup**
    Create a `.env.local` file with your Supabase credentials:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=your_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    ```

3.  **Database Setup**
    Run the SQL scripts in your Supabase Dashboard:
    *   `schema.sql` (Profiles & Needs)
    *   `schema_give.sql` (Gives & Storage)

4.  **Run Locally**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000)

## Project Structure

*   `/src/app/need`: The "Need" flow (Universal Input).
*   `/src/app/give`: The "Give" flow (Snap & List).
*   `/src/app/login`: Authentication pages.
*   `/src/components/ui`: Reusable UI components.
