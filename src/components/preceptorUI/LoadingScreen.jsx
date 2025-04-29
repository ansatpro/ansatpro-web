import RotatingText from '../RotatingText';

const LoadingScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#e6f4f1] text-[#3A6784] p-4">
        <div className="text-3xl sm:text-4xl font-extrabold flex flex-wrap justify-center items-center space-x-2">
            <span>ANSATPRO</span>
            <RotatingText
                texts={["AI makes life easier", "Creative", "Be your best friend", "Care!"]}
                mainClassName="px-2 py-1 bg-[#cceef1] text-[#2a5566] rounded-md text-2xl sm:text-3xl"
                staggerFrom="last"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-1"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={2000}
            />
        </div>
    </div>
);

export default LoadingScreen;
