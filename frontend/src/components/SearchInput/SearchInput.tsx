
import React from "react";
import styles from "./SearchInput.module.css";

type SearchInputProps = {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "pesquisar",
  value,
  onChange,
}) => {
  return (
    <div className={styles.wrapper}>
      <span className={styles.icon}>🔍</span>
      <input
        type="text"
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};






// import { useState } from "react";
// import { SearchInput } from "./components/SearchInput/SearchInput";

// export default function App() {
//   const [searchTerm, setSearchTerm] = useState("");

//   return (
//     <div>
//       <SearchInput
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//       />
//     </div>
//   );
// }
