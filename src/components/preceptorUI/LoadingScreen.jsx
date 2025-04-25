import RotatingText from '../RotatingText';

const LoadingScreen = () => (
    <div className="flex items-center justify-center min-h-screen bg-[#e6f4f1] text-[#3A6784] text-4xl font-extrabold">
        <span className="mr-2">ANSATPRO</span>
        <RotatingText
            texts={["AI make life easier", "creative", "Be your best friend", "care!"]}
            mainClassName="px-3 py-1 bg-[#cceef1] text-[#2a5566] rounded-md"
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
);
export default LoadingScreen;
