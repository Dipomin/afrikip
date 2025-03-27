import Link from "next/link";
import React from "react";

const ArchivesAnnees = () => {
  return (
    <div>
      <div className="grid lg:grid-cols-6 grid-cols-3 justify-between gap-2 pb-10">
        <Link href={"/journal/pdf/2009"}>
          <div className=" bg-slate-800 p-3 hover:bg-blue-950 text-white text-lg rounded-xl font-bold text-center">
            2009
          </div>
        </Link>
        <Link href={"/journal/pdf/2010"}>
          <div className=" bg-slate-800 p-3 hover:bg-blue-950 text-white text-lg rounded-xl font-bold text-center">
            2010
          </div>
        </Link>
        <Link href={"/journal/pdf/2011"}>
          <div className=" bg-slate-800 p-3 hover:bg-blue-950 text-white text-lg rounded-xl font-bold text-center">
            2011
          </div>
        </Link>
        <Link href={"/journal/pdf/2012"}>
          <div className=" bg-slate-800 p-3 hover:bg-blue-950 text-white text-lg rounded-xl font-bold text-center">
            2012
          </div>
        </Link>
        <Link href={"/journal/pdf/2013"}>
          <div className=" bg-slate-800 p-3 hover:bg-blue-950 text-white text-lg rounded-xl font-bold text-center">
            2013
          </div>
        </Link>
        <Link href={"/journal/pdf/2014"}>
          <div className=" bg-slate-800 p-3 hover:bg-blue-950 text-white text-lg rounded-xl font-bold text-center">
            2014
          </div>
        </Link>
        <Link href={"/journal/pdf/2015"}>
          <div className=" bg-slate-800 p-3 hover:bg-blue-950 text-white text-lg rounded-xl font-bold text-center">
            2015
          </div>
        </Link>
        <Link href={"/journal/pdf/2016"}>
          <div className=" bg-slate-800 p-3 hover:bg-blue-950 text-white text-lg rounded-xl font-bold text-center">
            2016
          </div>
        </Link>
        <Link href={"/journal/pdf/2017"}>
          <div className=" bg-slate-800 p-3 hover:bg-blue-950 text-white text-lg rounded-xl font-bold text-center">
            2017
          </div>
        </Link>
        <Link href={"/journal/pdf/2018"}>
          <div className=" bg-slate-800 p-3 hover:bg-blue-950 text-white text-lg rounded-xl font-bold text-center">
            2018
          </div>
        </Link>
        <Link href={"/journal/pdf/2019"}>
          <div className=" bg-slate-800 p-3 hover:bg-blue-950 text-white text-lg rounded-xl font-bold text-center">
            2019
          </div>
        </Link>
        <Link href={"/journal/pdf/2020"}>
          <div className=" bg-slate-800 p-3 hover:bg-blue-950 text-white text-lg rounded-xl font-bold text-center">
            2020
          </div>
        </Link>
        <Link href={"/journal/pdf/2021"}>
          <div className=" bg-slate-800 p-3 hover:bg-blue-950 text-white text-lg rounded-xl font-bold text-center">
            2021
          </div>
        </Link>
        <Link href={"/journal/pdf/2022"}>
          <div className=" bg-slate-800 p-3 hover:bg-blue-950 text-white text-lg rounded-xl font-bold text-center">
            2022
          </div>
        </Link>
        <Link href={"/journal/pdf/2023"}>
          <div className=" bg-slate-800 p-3 hover:bg-blue-950 text-white text-lg rounded-xl font-bold text-center">
            2023
          </div>
        </Link>
        <Link href={"/journal/pdf/2024"}>
          <div className=" bg-slate-800 p-3 hover:bg-blue-950 text-white text-lg rounded-xl font-bold text-center">
            2024
          </div>
        </Link>
        <Link href={"/journal/pdf/jour"}>
          <div className=" bg-red-700 p-3 hover:bg-blue-950 text-white lg:text-lg text-[12px] rounded-xl font-bold text-center">
            Aujourd&apos;hui
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ArchivesAnnees;
