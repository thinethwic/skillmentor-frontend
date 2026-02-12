import CardGroup from "./components/shared/CardGroup";
import Navbar from "./components/shared/Navigation";
import { Button } from "./components/ui/button";
import type { CardElement } from "./types";

function App() {
  const cards: CardElement[] = [
    {
      title: "AWS Developer Associate Exam Prep",
      positiveRate: "99% positive reviews",
      instructor: "Michelle Burns",
      roleLine: "Tech Lead at IFS",
      tutorSince: "Tutor since 2018",
      enrollments: 158,
      description:
        "Hi! I'm Michelle. Language lover and tutor of English. I specialize in AWS certification preparation and have helped over 150 students achieve their AWS Developer Associate certification. With my background in cloud computing and software development, I can provide practical insights and real-world examples to help you understand complex concepts. I also offer mock interviews and hands-on coding sessions.",
    },
    {
      title: "AWS DevOps Engineering Professional Exam Prep",
      positiveRate: "98%",
      instructor: "Daniel Perera",
      roleLine: "Senior DevOps Engineer",
      tutorSince: "Tutor since 2017",
      enrollments: 203,
      description:
        "Senior DevOps Engineer with Fortune 500 experience. Specialized in CI/CD, Kubernetes, Docker, and infrastructure as code. Sessions include hands-on automation scenarios and real-world DevOps workflows.",
    },
    {
      title: "AWS Solutions Architect Associate",
      positiveRate: "97%",
      instructor: "Nishan Fernando",
      roleLine: "Cloud Architect at Virtusa",
      tutorSince: "Tutor since 2019",
      enrollments: 121,
      description:
        "Cloud Architect focused on scalable system design and AWS best practices. I help students master architecture patterns, cost optimization, and exam strategies with real-world case studies.",
    },
    {
      title: "Docker & Kubernetes Bootcamp",
      positiveRate: "96%",
      instructor: "Saman Wijesinghe",
      roleLine: "Platform Engineer",
      tutorSince: "Tutor since 2020",
      enrollments: 89,
      description:
        "Hands-on containerization and orchestration training. Learn Docker fundamentals, Kubernetes deployments, scaling, and production-grade cluster management.",
    },
    {
      title: "React + Tailwind Masterclass",
      positiveRate: "100%",
      instructor: "Thineth Wick",
      roleLine: "Full Stack Developer",
      tutorSince: "Tutor since 2023",
      enrollments: 65,
      description:
        "Modern frontend development using React, Vite, and Tailwind CSS. Learn how to build scalable UI systems, dashboards, and production-ready applications.",
    },
    {
      title: "Spring Boot Backend Development",
      positiveRate: "98%",
      instructor: "Amila Jayasinghe",
      roleLine: "Backend Engineer",
      tutorSince: "Tutor since 2018",
      enrollments: 142,
      description:
        "Comprehensive backend development with Spring Boot. Covers REST APIs, JPA, authentication, role-based access control, and real-world system architecture.",
    },
  ];
  return (
    <div className=" bg-slate-50">
      <section>
        <Navbar />
      </section>
      <section className="px-4">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center py-20 text-center">
          <h1 className="text-4xl font-semibold  sm:text-6xl md:text-7xl">
            Find your SkillMentor
          </h1>

          <p className="mt-6 max-w-3xl text-lg  text-slate-500 sm:text-xl md:text-2xl">
            Empower your career with personalized mentorship for AWS Developer
            Associate, Interview Prep, and more.
          </p>

          <Button className="mt-6 rounded-lg bg-yellow-400 px-8 py-6 text-base font-semibold text-black hover:bg-yellow-500 sm:text-lg">
            Sign up to see all tutors
          </Button>
        </div>
      </section>

      <section className="px-2 pb-16">
        <div className="mx-auto max-w-7xl">
          <CardGroup cardElements={cards} />
        </div>
      </section>
    </div>
  );
}

export default App;
