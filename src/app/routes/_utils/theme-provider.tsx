import React, {ReactNode, createContext, useContext, useState} from "react";

type ThemeContextType = {
  theme: string;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "retro",
  toggleTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({children}: ThemeProviderProps) => {
  // const currentStorageTheme = localStorage.getItem("theme");
  // function setLocalStorage(currentTheme: string) {
  //   localStorage.setItem(
  //     "theme",
  //     currentTheme === "forest" ? "retro" : "forest",
  //   );
  // }
  const currentStorageTheme = null;
  const [theme, setTheme] = useState(currentStorageTheme ?? "retro");

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      console.log("Toggling theme from", currentTheme);
      // setLocalStorage(currentTheme);
      return currentTheme === "forest" ? "retro" : "forest";
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
