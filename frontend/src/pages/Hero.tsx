import HeroNav from "../components/HeroNav";

function Hero() {
  return (
    <>
      <HeroNav />
      <div className="h-screen flex flex-col justify-center items-center bg-black text-white">
        <div>Hero</div>
      </div>
    </>
  );
}

export default Hero;
