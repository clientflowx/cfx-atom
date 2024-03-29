"use client";

import { convertStoMs, parseTimeStringInS } from "@/utils";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";

import { Bar } from "react-chartjs-2";
import { CallDurationType } from "./types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
interface CallDataType {
  totalCall: number;
  duration: number | string;
}
interface agentMapType {
  [agentName: string]: CallDataType;
}

const TopAgents: React.FC<{
  callDuration: CallDurationType[];
  nameFilter: string;
  type: string | null;
  minDurationFilter: number;
}> = ({ callDuration, nameFilter, minDurationFilter, type }) => {
  const agentMap: agentMapType = {};

  callDuration.forEach((call: CallDurationType) => {
    let agentName = call?.agent;

    if (agentMap[agentName]) {
      let currAgentObj = { ...agentMap[agentName] };
      agentMap[agentName].totalCall = currAgentObj.totalCall + 1;

      if (typeof call.duration !== "string")
        agentMap[agentName].duration = +currAgentObj.duration + call.duration;
      else {
        const callDurationArr =
          call.duration.length === 0
            ? "00:00:00".split(":")
            : call.duration.split(":");
        let seconds = callDurationArr[2];
        let minutes = callDurationArr[1];
        let hours = callDurationArr[0];
        let totalCallDuration = 0,
          newDuration = 0;
        totalCallDuration += +hours * 3600 + +minutes * 60 + +seconds;
        newDuration += +currAgentObj.duration + +seconds;
        agentMap[agentName].duration = newDuration;
      }
    } else {
      let agentObj = {
        totalCall: 1,
        duration: call.duration,
      };

      if (typeof call.duration === "string") {
        let duration = call.duration.length === 0 ? "00:00:00" : call.duration;
        let totalCallDuration = 0;
        totalCallDuration += parseTimeStringInS(String(duration));
        agentObj.duration = totalCallDuration;
      }

      agentMap[agentName] = { ...agentObj };
    }
  });

  for (let key in agentMap) {
    let durationObj = convertStoMs(+agentMap[key].duration);
    agentMap[
      key
    ].duration = `${durationObj.hours}:${durationObj.minutes}:${durationObj.seconds}`;
  }

  const agentEntries = Object.entries(agentMap);

  agentEntries.sort((a: [string, CallDataType], b: [string, CallDataType]) => {
    return b[1].totalCall - a[1].totalCall;
  });

  const sortedAgentMap = [];
  for (let entry in agentEntries) {
    let agentName = agentEntries?.[entry]?.[0];
    let agentData: CallDataType = agentEntries?.[entry]?.[1];

    const agentObj = { ...agentData, agentName };
    sortedAgentMap.push(agentObj);
  }

  const filteredAgentMap = sortedAgentMap.filter((call) => {
    let parsedDuration = parseTimeStringInS(String(call.duration));

    return (
      (nameFilter === "all" || call.agentName === nameFilter) &&
      (minDurationFilter === 0 || +parsedDuration >= minDurationFilter)
    );
  });

  const callLabels = filteredAgentMap.map((el) => el.agentName);

  const callData = filteredAgentMap.map((el) => el.totalCall);

  const callBg = ["rgba(52,211,153)", "rgba(255, 99, 132)"];

  const columns = ["Agents", "Total Calls", "Total Duration"];
  const data = {
    labels: callLabels,
    datasets: [
      {
        label: "No. of Calls",
        data: callData,
        backgroundColor: callBg,
        borderWidth: 0.2,
        barThickness: 30,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    borderRadius: 2,
    hoverBorderWidth: 0,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="w-full p-4 flex flex-col rounded overflow-hidden shadow-lg mt-4">
      <div className="text-xl mb-2"> Top Agents</div>
      <div className="w-full border-t-2 border-bg-gray" />
      <div className="px-6 py-4 flex flex-col justify-center items-center">
        <div className="w-full flex lg:flex-row md:flex-col sm:flex-col sm:justify-center sm:items-center md:justify-center md:items-center lg:items-start lg:justify-between text-center">
          <div className="lg:w-2/5 md:w-3/5 sm:w-4/5 flex pr-4 lg:border-r lg:border-bg-gray-100 md:border-none">
            <Bar data={data} options={options} />
          </div>
          <div className="lg:w-3/5 md:w-full sm:w-full md:pl-0 md:mt-6 sm:mt-6 lg:pl-4 text-center relative overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right border-spacing-4 text-gray-500 ">
              <thead className="text-xs text-gray-700 uppercase ">
                <tr>
                  {columns.map((column, idx) => (
                    <th
                      scope="col"
                      key={`column-${idx}`}
                      className="px-6 py-3 text-center bg-gray-100"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAgentMap.map((log, index) => {
                  return (
                    <tr
                      key={`agent-${index}`}
                      className="border-t border-bg-gray-200 hover:bg-gray-100"
                    >
                      <td className="py-4 text-center">{log?.agentName}</td>
                      <td className="pt-4 text-center">{log?.totalCall}</td>
                      <td className="pt-4 text-center">{log?.duration}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopAgents;
