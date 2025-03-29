// import { createContext, useEffect, useState } from "react";
// import { supabase } from "../supabaseClient"; // Ensure correct import

// export const UserContext = createContext(null); // Set default value as null

// export const UserProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true); // Track loading state

//   useEffect(() => {
//     const fetchUser = async () => {
//       setLoading(true);
//       const { data, error } = await supabase.auth.getSession();

//       if (error) {
//         console.error("❌ Profile fetch error:", error);
//       } else if (data?.session) {
//         setUser(data.session.user);
//       }
//       setLoading(false);
//     };

//     fetchUser();

//     // ✅ Listen for authentication state changes
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((event, session) => {
//       if (session) {
//         setUser(session.user);
//       } else {
//         setUser(null);
//       }
//     });

//     return () => subscription?.unsubscribe(); // Cleanup listener on unmount
//   }, []);

//   return (
//     <UserContext.Provider value={{ user, setUser, loading }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

import { createContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (!error) setUser(data.user);
        };
        fetchUser();
    }, []);

    return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};
