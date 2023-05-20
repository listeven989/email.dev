import React, { useEffect } from "react";
import fs from "fs";
import path from "path";

export async function getStaticProps() {
  const pagesDirectory = path.join(process.cwd(), "src/pages");
  const filenames = fs.readdirSync(pagesDirectory);

  const routes = filenames
    .filter(
      (filename) =>
        !filename.startsWith("_") &&
        !filename.includes("index") &&
        !filename.startsWith("api")
    )
    .map((filename) => {
      const routePath = filename.replace(/\.tsx$/, "");

      return {
        name: routePath,
        path: `/${routePath}`,
      };
    });

  return {
    props: {
      routes,
    },
  };
}

const Index = ({}) => {
  useEffect(() => {
    // redirect to /campaigns
    window.location.href = "/campaigns";
  });

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        {/* <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-xl font-bold mb-4">Building you a great experience. Loading...</h1>
        </div> */}
        <div>Loading</div>
      </div>
    </div>
  );
};

export default Index;
