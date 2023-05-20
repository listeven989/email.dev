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
        <div>Loading</div>
      </div>
    </div>
  );
};

export default Index;
