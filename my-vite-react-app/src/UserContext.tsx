
import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
  
  // 1. Defina o tipo do usuário (pode ajustar conforme seu token)
  type User = {
  id: number;
  name: string;
  email: string;
  farmId: number;
  role: "farmer" | "veterinarian";
};

  
  // 2. Tipo do contexto
  type UserContextType = {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
  };
  
  // 3. Crie o contexto com tipo ou valor inicial nulo
  export const UserContext = createContext<UserContextType | undefined>(undefined);
  
  // 4. Defina as props do provider
  type UserProviderProps = {
    children: ReactNode;
  };
  
  export const UserProvider = ({ children }: UserProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
  
    useEffect(() => {
      const token = localStorage.getItem("token");
      if (token) {
        fetch("http://localhost:8000/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then(res => {
            if (!res.ok) throw new Error("Erro ao buscar utilizador");
            return res.json();
          })
          .then(data => {
            setUser({
              id: data.id,
              name: data.name,
              email: data.email,
              farmId: data.farm_id,
              role: data.role,
            });
          })
          .catch(err => {
            console.error("Erro ao carregar utilizador:", err);
            localStorage.removeItem("token");
          });
      }
    }, []);

  
    return (
      <UserContext.Provider value={{ user, setUser }}>
        {children}
      </UserContext.Provider>
    );
  };
  
  // 5. Hook customizado
  export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
      throw new Error("useUser deve ser usado dentro de UserProvider");
    }
    return context;
  };
  