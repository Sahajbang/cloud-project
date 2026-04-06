import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect } from "react";
import useCallStore from "../store/useCallStore";

const panelVariants = {
  hidden: { x: "100%" },
  visible: { x: 0 },
  exit: { x: "100%" },
};

const VideoPanel = () => {
  const {
    isVideoPanelVisible,
    localStream,
    remoteStream,
    endCall,
  } = useCallStore();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Assign localStream to local video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Assign remoteStream to remote video
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Cleanup video streams when panel hides
  useEffect(() => {
    if (!isVideoPanelVisible) {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    }
  }, [isVideoPanelVisible]);

  return (
    <AnimatePresence>
      {isVideoPanelVisible && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={panelVariants}
          transition={{ type: "tween", duration: 0.4 }}
          className="h-full w-full sm:w-[400px] bg-gray-900 flex flex-col items-center justify-between px-4 py-6 gap-4 border-l border-gray-800"
        >
          {/* Local Video */}
          <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>

          {/* Remote Video */}
          <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>

          {/* End Call Button */}
          <button
            onClick={() => endCall({ localVideoRef, remoteVideoRef })}
            className="mt-auto bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full text-lg"
          >
            End Call
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoPanel;


// import { motion, AnimatePresence } from "framer-motion";
// import { useCallStore } from "../store/useCallStore";

// const panelVariants = {
//   hidden: { x: "100%" },
//   visible: { x: 0 },
//   exit: { x: "100%" },
// };

// const VideoPanel = () => {
//   const {
//     isVideoPanelVisible,
//     localStream,
//     remoteStream,
//     endCall,
//   } = useCallStore();

//   return (
//     <AnimatePresence>
//       {isVideoPanelVisible && (
//         <motion.div
//           initial="hidden"
//           animate="visible"
//           exit="exit"
//           variants={panelVariants}
//           transition={{ type: "tween", duration: 0.4 }}
//           className="h-full w-full sm:w-[400px] bg-gray-900 flex flex-col items-center justify-between px-4 py-6 gap-4 border-l border-gray-800"
//         >
//           {/* Local Video */}
//           <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
//             <video
//               ref={(video) => {
//                 if (video && localStream) video.srcObject = localStream;
//               }}
//               autoPlay
//               playsInline
//               muted
//               className="w-full h-full object-cover"
//             />
//           </div>

//           {/* Remote Video */}
//           <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
//             <video
//               ref={(video) => {
//                 if (video && remoteStream) video.srcObject = remoteStream;
//               }}
//               autoPlay
//               playsInline
//               className="w-full h-full object-cover"
//             />
//           </div>

//           {/* End Call Button */}
//           <button
//             onClick={endCall}
//             className="mt-auto bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full text-lg"
//           >
//             End Call
//           </button>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// export default VideoPanel;


