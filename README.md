## Backend Setup

PulseWatch uses MongoDB for data persistence and Vercel/GitHub Actions for scheduling checks.

### 1. Database Setup

1. Create a MongoDB Atlas cluster (M0 Free Tier is sufficient).
2. Create a database named `pulsewatch`.
3. Create a `.env.local` file with:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   MONGODB_DB=pulsewatch
   ```

### 2. Seeding Data

To populate your dashboard with mock data and create initial indexes, send a POST request to:
`/api/seed`

### 3. Scheduling Checks

Set up a cron job (every 10 minutes) to hit the following endpoint:
`/api/check/run`

- **Vercel**: Add a `vercel.json` with a cron configuration.
- **GitHub Actions**: Use a scheduled workflow.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
