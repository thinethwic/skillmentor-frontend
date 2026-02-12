import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="container bg-black text-white px-8 py-4 flex justify-between items-center">
      <div className="flex items-center gap-x-3 pl-15">
        <img
          src="https://skillmentor-frontend.vercel.app/assets/logo-iWUvXd4s.webp"
          alt="SkillMentor Logo"
          className="w-10 h-10 rounded-full"
        />

        <h1 className="font-semibold text-xl">SkillMentor</h1>

        <a href="#" className="hover:text-yellow-400 transition pl-2">
          Tutors
        </a>
        <a href="#" className="hover:text-yellow-400 transition">
          About Us
        </a>
        <a href="#" className="hover:text-yellow-400 transition">
          Resources
        </a>
      </div>

      <div className="flex items-center gap-x-6 pr-16">
        <a href="#" className="text-sm hover:text-yellow-400 transition">
          Login
        </a>

        <Button className="bg-yellow-400 text-black hover:bg-yellow-500 rounded-md px-4 py-2">
          Sign up
        </Button>
      </div>
    </nav>
  );
}
