// auth-check.js
// Include this on any page that requires login

const SUPABASE_URL = "https://xagbguncsimivveezckc.supabase.co";
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhZ2JndW5jc2ltaXZ2ZWV6Y2tjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjMyNDYsImV4cCI6MjA4ODYzOTI0Nn0.ex9vOixzsQ-p4gh9wQ5I3akcQAitdNlyv5XEgZYVc9k';

let client;

/* WAIT UNTIL SUPABASE LIBRARY IS LOADED */
function createClient() {
    if (!window.supabase) {
        console.error("Supabase library not loaded.");
        window.location.href = "login.html";
        return null;
    }

    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return client;
}

async function checkAuth() {

    const supabase = createClient();
    if (!supabase) return;

    try {

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            window.location.href = "login.html";
            return null;
        }

        const user = session.user;

        console.log("Logged in as:", user.email);

        return { session, user };

    } catch (error) {

        console.error("Auth check failed:", error);
        window.location.href = "login.html";
        return null;

    }

}

/* RUN AUTOMATICALLY */
checkAuth();