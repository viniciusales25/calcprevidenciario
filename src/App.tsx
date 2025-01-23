import React, { FC } from "react";
import CalculadoraPrevidenciaria from "./components/CalculadoraPrevidenciaria.tsx";

const App: FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <CalculadoraPrevidenciaria />
    </div>
  );
};

export default App;
