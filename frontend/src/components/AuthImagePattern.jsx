// const AuthImagePattern = ({ title, subtitle }) => {
//   return (
//     <div className="hidden lg:flex items-center justify-center bg-base-200 p-12">
//       <div className="max-w-md text-center">
//         <div className="grid grid-cols-3 gap-3 mb-8">
//           {[...Array(9)].map((_, i) => (
//             <div
//               key={i}
//               className={`aspect-square rounded-2xl bg-primary/10 ${
//                 i % 2 === 0 ? "animate-pulse" : ""
//               }`}
//             />
//           ))}
//         </div>
//         <h2 className="text-2xl font-bold mb-4">{title}</h2>
//         <p className="text-base-content/60">{subtitle}</p>
//       </div>
//     </div>
//   );
// };

// export default AuthImagePattern;

const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-20 min-h-screen">
      <div className="max-w-md text-center">
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-xl bg-primary/10 animate-bounce glow-on-hover ${
                i % 4 === 0 ? "delay-100" :
                i % 4 === 1 ? "delay-200" :
                i % 4 === 2 ? "delay-300" : "delay-400"
              }`}
              style={{
                animationDuration: `${1 + (i % 4) * 0.2}s`,
                color: 'rgb(99 102 241 / 0.5)',
              }}
            />
          ))}
        </div>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-base-content/60">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;

// import React, { useState, useEffect } from "react";

// const AuthImagePattern = ({ title, subtitle }) => {
//   const gridSize = 4; // Define grid size (4x4)

//   // Generate initial grid with row and column positions
//   const [grid, setGrid] = useState(
//     Array.from({ length: gridSize * gridSize }, (_, i) => ({
//       id: i,
//       row: Math.floor(i / gridSize),
//       col: i % gridSize,
//     }))
//   );

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setGrid((prevGrid) => {
//         const newGrid = [...prevGrid];

//         // Pick a random square
//         const randomIndex = Math.floor(Math.random() * newGrid.length);
//         const randomSquare = newGrid[randomIndex];

//         // Determine possible adjacent squares
//         const adjacentSquares = [];
//         if (randomSquare.row > 0)
//           adjacentSquares.push(
//             newGrid.find(
//               (sq) => sq.row === randomSquare.row - 1 && sq.col === randomSquare.col
//             )
//           );
//         if (randomSquare.row < gridSize - 1)
//           adjacentSquares.push(
//             newGrid.find(
//               (sq) => sq.row === randomSquare.row + 1 && sq.col === randomSquare.col
//             )
//           );
//         if (randomSquare.col > 0)
//           adjacentSquares.push(
//             newGrid.find(
//               (sq) => sq.row === randomSquare.row && sq.col === randomSquare.col - 1
//             )
//           );
//         if (randomSquare.col < gridSize - 1)
//           adjacentSquares.push(
//             newGrid.find(
//               (sq) => sq.row === randomSquare.row && sq.col === randomSquare.col + 1
//             )
//           );

//         // Pick a random adjacent square to swap with
//         const targetSquare =
//           adjacentSquares[
//             Math.floor(Math.random() * adjacentSquares.length)
//           ];

//         // Swap their positions
//         if (targetSquare) {
//           const tempRow = randomSquare.row;
//           const tempCol = randomSquare.col;
//           randomSquare.row = targetSquare.row;
//           randomSquare.col = targetSquare.col;
//           targetSquare.row = tempRow;
//           targetSquare.col = tempCol;
//         }

//         return newGrid;
//       });
//     }, 400); // Swap every second

//     return () => clearInterval(interval);
//   }, [gridSize]);

//   return (
//     <div className="hidden lg:flex items-center justify-center bg-base-200 p-12 min-h-screen relative">
//       <div
//         className="relative"
//         style={{
//           width: `${gridSize * 60}px`, // Square size + gap
//           height: `${gridSize * 60}px`,
//         }}
//       >
//         {grid.map((square) => (
//           <div
//             key={square.id}
//             className="absolute w-12 h-12 rounded-xl bg-primary transition-transform duration-400"
//             style={{
//               transform: `translate(${square.col * 60}px, ${square.row * 60}px)`,
//             }}
//           />
//         ))}
//       </div>
//       <div className="text-center mt-8">
//         <h2 className="text-2xl font-bold mb-4">{title}</h2>
//         <p className="text-base-content/60">{subtitle}</p>
//       </div>
//     </div>
//   );
// };

// export default AuthImagePattern;


// const AuthImagePattern = () => {
//   const gridSize = 25;

//   return (
//     <div className="hidden lg:flex items-center justify-center bg-base-200 p-12 min-h-screen">
//       <div className="grid grid-cols-[repeat(25,_minmax(0,_1fr))] gap-2">
//         {[...Array(gridSize * gridSize)].map((_, i) => {
//           const row = Math.floor(i / gridSize);
//           const col = i % gridSize;
//           return (
//             <div
//               key={i}
//               className="w-2 h-2 rounded-full bg-primary"
//               style={{
//                 animation: `wave 4s ease-in-out infinite`,
//                 animationDelay: `${(row + col) * 0.1}s`,
//               }}
//             />
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default AuthImagePattern;


// const AuthImagePattern = () => {
//   const gridSize = 25;

//   return (
//     <div className="hidden lg:flex items-center justify-center bg-base-200 p-12 min-h-screen">
//       <div className="grid grid-cols-[repeat(25,_minmax(0,_1fr))] gap-2">
//         {[...Array(gridSize * gridSize)].map((_, i) => {
//           const row = Math.floor(i / gridSize);
//           const col = i % gridSize;
//           return (
//             <div
//               key={i}
//               className="w-2 h-2 rounded-full bg-primary"
//               style={{
//                 animation: `wave 4s ease-in-out infinite`,
//                 animationDelay: `${(row + col) * 0.2}s`,
//               }}
//             />
//           );
//         })}
//       </div>
//       <style jsx>{`
//         @keyframes wave {
//           0%, 100% {
//             transform: translateY(0);
//           }
//           50% {
//             transform: translateY(-10px);
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default AuthImagePattern;

// import React, { useEffect, useRef } from "react";

// const AuthImagePattern = () => {
//   const gridSize = 20; // Adjust grid size (number of rows/columns)
//   const dotSize = 10; // Size of the dots in pixels
//   const gap = 20; // Gap between dots in pixels
//   const dotRefs = useRef([]);

//   useEffect(() => {
//     const handleMouseMove = (e) => {
//       const { clientX, clientY } = e;

//       dotRefs.current.forEach((dot) => {
//         if (!dot) return;

//         const { left, top } = dot.getBoundingClientRect();
//         const dx = clientX - (left + dotSize / 2);
//         const dy = clientY - (top + dotSize / 2);
//         const distance = Math.sqrt(dx * dx + dy * dy);

//         // Apply ripple effect
//         const scale = Math.max(1, 3 - distance / 100); // Closer dots scale up more
//         dot.style.transform = `scale(${scale})`;
//         dot.style.transition = `transform 0.3s ease-out`;
//       });
//     };

//     const resetDots = () => {
//       dotRefs.current.forEach((dot) => {
//         if (!dot) return;
//         dot.style.transform = "scale(1)";
//         dot.style.transition = "transform 0.6s ease-out";
//       });
//     };

//     window.addEventListener("mousemove", handleMouseMove);
//     window.addEventListener("mouseleave", resetDots);

//     return () => {
//       window.removeEventListener("mousemove", handleMouseMove);
//       window.removeEventListener("mouseleave", resetDots);
//     };
//   }, []);

//   return (
//     <div
//       className="relative w-full h-screen bg-black"
//       style={{
//         display: "grid",
//         gridTemplateColumns: `repeat(auto-fill, ${dotSize + gap}px)`,
//         gridGap: `${gap}px`,
//         justifyContent: "center",
//         alignItems: "center",
//       }}
//     >
//       {[...Array(gridSize * gridSize)].map((_, i) => (
//         <div
//           key={i}
//           ref={(el) => (dotRefs.current[i] = el)}
//           style={{
//             width: `${dotSize}px`,
//             height: `${dotSize}px`,
//             backgroundColor: "green",
//             borderRadius: "50%",
//           }}
//         />
//       ))}
//     </div>
//   );
// };

// export default AuthImagePattern;



