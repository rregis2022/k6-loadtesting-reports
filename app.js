console.log("k6 Dashboard loaded");

const demoReports = [
{
run: 101,
date: "2026-08-10",
environment: "k6",
vus: 10,
requests: 850,
p95: 720,
failureRate: 0.012
},
{
run: 102,
date: "2026-08-11",
environment: "k6",
vus: 15,
requests: 1120,
p95: 810,
failureRate: 0.018
},
{
run: 103,
date: "2026-08-12",
environment: "k6",
vus: 20,
requests: 1450,
p95: 925,
failureRate: 0.025
}
];

document.addEventListener("DOMContentLoaded", () => {

const reportsContainer = document.getElementById("reports");

if (!reportsContainer) {
return;
}

reportsContainer.innerHTML = `
<h2>Historical Test Runs</h2>

<table>
<thead>
<tr>
<th>Run</th>
<th>Date</th>
<th>Environment</th>
<th>VUs</th>
<th>Requests</th>
<th>P95</th>
<th>Failure Rate</th>
</tr>
</thead>

<tbody>
${demoReports.map(report => `
<tr>
<td>${report.run}</td>
<td>${report.date}</td>
<td>${report.environment}</td>
<td>${report.vus}</td>
<td>${report.requests}</td>
<td>${report.p95} ms</td>
<td>${(report.failureRate * 100).toFixed(2)}%</td>
</tr>
`).join("")}
</tbody>
</table>
`;
});