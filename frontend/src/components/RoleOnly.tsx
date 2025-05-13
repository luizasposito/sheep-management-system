
import { ReactNode } from "react";
import { useUser } from "../UserContext"; // ajuste o caminho se necessário

type RoleOnlyProps = {
  role: "farmer" | "vet";
  children: ReactNode;
};

export const RoleOnly = ({ role, children }: RoleOnlyProps) => {
  const { user } = useUser();
  return user?.role === role ? <>{children}</> : null;
};
