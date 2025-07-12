# Gloomhaven Tracker

A comprehensive web application for managing Gloomhaven scenarios, monsters, and bosses. Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## 🎯 Features

- **Scenario Management**: Create custom scenarios with adjustable difficulty levels (1-7)
- **Monster & Boss Selection**: Choose from a variety of Gloomhaven creatures
- **Individual NPC Tracking**: Monitor each creature's health, conditions, and abilities
- **Real-time Updates**: Live synchronization across devices using Supabase
- **Beautiful UI**: Modern, responsive design with Tailwind CSS
- **Condition Management**: Track status effects like poison, stun, immobilize, etc.
- **Health Management**: Easy health adjustment with visual health bars

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier available)
- Vercel account for deployment

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gloomheaven-tracker.git
   cd gloomheaven-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and anon key
   - Create the required tables using the SQL below

4. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

Run this SQL in your Supabase SQL editor to create the required tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create scenarios table
CREATE TABLE scenarios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 7),
  user_id TEXT NOT NULL
);

-- Create npcs table
CREATE TABLE npcs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('monster', 'boss')),
  max_health INTEGER NOT NULL,
  current_health INTEGER NOT NULL,
  conditions TEXT[] DEFAULT '{}',
  abilities TEXT[] DEFAULT '{}',
  position INTEGER NOT NULL DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX idx_scenarios_user_id ON scenarios(user_id);
CREATE INDEX idx_npcs_scenario_id ON npcs(scenario_id);
CREATE INDEX idx_npcs_position ON npcs(position);

-- Enable Row Level Security (RLS)
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE npcs ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth requirements)
CREATE POLICY "Allow all operations for now" ON scenarios FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON npcs FOR ALL USING (true);
```

## 🚀 Deployment on Vercel

### Option 1: Deploy via GitHub (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect it's a Next.js project

3. **Add Environment Variables**
   - In Vercel dashboard, go to Settings > Environment Variables
   - Add your Supabase environment variables (see below for where to find them)
   
   **Finding your Supabase Environment Variables:**
   
   1. Go to your Supabase project dashboard at [supabase.com](https://supabase.com)
   2. Click on your project
   3. In the left sidebar, click on **Settings** (gear icon)
   4. Click on **API** in the settings menu
   5. You'll see your project credentials:
   
   ![Supabase API Settings](https://supabase.com/docs/img/api-url-anon-key.png)
   
   - **Project URL**: Copy the "Project URL" value for `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key**: Copy the "anon public" key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key**: Copy the "service_role" key for `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)
   
   **Add these to Vercel:**
   
   In your Vercel project dashboard, go to Settings > Environment Variables and create **3 separate variables**:
   
   **Variable 1:**
   - **Name:** `NEXT_PUBLIC_SUPABASE_URL`
   - **Value:** Your Project URL (e.g., `https://abcdefghijklmnop.supabase.co`)
   
   **Variable 2:**
   - **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value:** Your anon public key (e.g., `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   
   **Variable 3:**
   - **Name:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** Your service_role key (e.g., `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   
   💡 **Important:** You create each variable separately by clicking "Add" for each one. The **Name** field gets the variable name (like `NEXT_PUBLIC_SUPABASE_URL`) and the **Value** field gets the actual URL/key from Supabase.

4. **Deploy**
   - Vercel will automatically deploy on every push to main

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

## 🎮 How to Use

1. **Create a Scenario**
   - Click "Create New Scenario"
   - Enter scenario name and select level (1-7)
   - Choose monsters and/or bosses from the available options
   - Set the quantity for each creature type

2. **Manage NPCs**
   - Each NPC gets its own card with health, conditions, and abilities
   - Use +/- buttons or input field to adjust health
   - Click on conditions to toggle them on/off
   - Use quick actions for common operations (defeat, full heal)

3. **Track Progress**
   - View scenario statistics in the header
   - Dead NPCs appear with reduced opacity
   - All changes are automatically saved to the database

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Deployment**: Vercel
- **Utilities**: clsx for conditional classes

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/
│   ├── NPCCard.tsx          # Individual NPC management
│   ├── ScenarioCreator.tsx  # Scenario creation form
│   └── ScenarioManager.tsx  # Main scenario interface
├── lib/
│   └── supabase.ts          # Supabase client configuration
└── types/
    └── gloomhaven.ts        # TypeScript type definitions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the board game Gloomhaven by Isaac Childres
- Built with modern web technologies for the best user experience
- Special thanks to the Next.js and Supabase teams for their excellent documentation

## 🐛 Troubleshooting

### Common Issues

1. **Supabase Connection Issues**
   - Verify your environment variables are correct
   - Check that your Supabase project is active
   - Ensure RLS policies allow the operations you're trying to perform

2. **Build Errors**
   - Run `npm run build` locally to check for TypeScript errors
   - Ensure all dependencies are properly installed

3. **Deployment Issues**
   - Check Vercel build logs for specific error messages
   - Verify environment variables are set in Vercel dashboard

Need help? Open an issue on GitHub!
