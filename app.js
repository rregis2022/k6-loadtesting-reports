const REPORT_BASE_URL = "./reports/";


/*
 * Load report index
 */
async function loadReportIndex() {

    const response = await fetch(
        `${REPORT_BASE_URL}index.json?cache=${Date.now()}`,
        {
            cache: "no-store"
        }
    );

    if (!response.ok) {
        throw new Error("Unable to load reports/index.json");
    }

    return await response.json();
}


/*
 * Load an individual k6 JSON report
 */
async function loadReport(filename) {

    const response = await fetch(
        `${REPORT_BASE_URL}${encodeURIComponent(filename)}?cache=${Date.now()}`,
        {
            cache: "no-store"
        }
    );

    if (!response.ok) {
        throw new Error(`Unable to load report: ${filename}`);
    }

    return await response.json();
}


/*
 * Extract k6 metrics
 */
function extractMetrics(report) {

    const metrics = report.metrics || {};

    const duration =
        metrics.http_req_duration || {};

    const requests =
        metrics.http_reqs || {};

    const failed =
        metrics.http_req_failed || {};

    const vus =
        metrics.vus || {};

    return {

        vus: vus.value ?? 0,

        requests: requests.count ?? 0,

        requestRate: requests.rate ?? 0,

        average: duration.avg ?? 0,

        median: duration.med ?? 0,

        p90: duration["p(90)"] ?? 0,

        p95: duration["p(95)"] ?? 0,

        max: duration.max ?? 0,

        failureRate: failed.value ?? 0
    };
}


/*
 * Extract date from k6 report filename
 *
 * Example:
 * k6_url-summary-run-18-20260813-134232-473398897.json
 */
function getReportDate(filename) {

    const match =
        filename.match(/(\d{8})-(\d{6})/);

    if (!match) {
        return "Unknown date";
    }

    const date =
        match[1];

    return `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;
}


/*
 * Determine dashboard status
 *
 * These are currently DEMO thresholds.
 * We will later replace these with
 * explicit performance requirements.
 */
function getStatus(failureRate) {

    if (failureRate > 5) {
        return "fail";
    }

    if (failureRate > 1) {
        return "warn";
    }

    return "pass";
}


const STATUS_LABEL = {

    pass: "Passed",

    warn: "Degraded",

    fail: "Failed"

};


/*
 * Render one historical run
 */
function renderRun(filename, report) {

    const metrics =
        extractMetrics(report);

    const date =
        getReportDate(filename);

    const errorRate =
        metrics.failureRate * 100;

    const status =
        getStatus(errorRate);


    return `

        <a
            class="run ${status}"
            href="${REPORT_BASE_URL}${encodeURIComponent(filename)}"
            target="_blank"
            rel="noopener noreferrer"
        >

            <div class="run-meta">

                <span class="build">
                    ${filename}
                </span>

                ${date}

            </div>


            <div class="run-body">

                <span class="env">
                    k6
                </span>

                <div class="metrics">

                    VUs
                    <b>${metrics.vus}</b>

                    · Requests
                    <b>${Number(metrics.requests).toLocaleString()}</b>

                    · p95
                    <b>${metrics.p95.toFixed(2)} ms</b>

                    · errors
                    <b>${errorRate.toFixed(2)}%</b>

                </div>

            </div>


            <span
                class="status-badge ${status}"
            >

                ${STATUS_LABEL[status]}

            </span>

        </a>

    `;
}


/*
 * Initialize dashboard
 */
async function init() {

    const runsEl =
        document.getElementById("runs");

    const runCount =
        document.getElementById("runCount");


    try {

        runsEl.innerHTML =
            `<div class="empty">
                Loading report history...
            </div>`;


        /*
         * Load index.json
         */
        const index =
            await loadReportIndex();


        console.log(
            "k6 report index:",
            index
        );


        if (
            !index.reports ||
            index.reports.length === 0
        ) {

            runsEl.innerHTML =
                `<div class="empty">
                    No reports published yet.
                </div>`;

            return;
        }


        /*
         * Load all reports
         */
        const reports = [];


        for (
            const filename
            of index.reports
        ) {

            try {

                const report =
                    await loadReport(filename);


                reports.push({

                    filename,

                    report

                });


            } catch (error) {

                console.error(
                    `Unable to load ${filename}`,
                    error
                );

            }

        }


        if (reports.length === 0) {

            runsEl.innerHTML =
                `<div class="empty">
                    Reports were found in index.json,
                    but none could be loaded.
                </div>`;

            return;
        }


        /*
         * Display number of reports
         */
        runCount.textContent =
            `${reports.length} report${
                reports.length === 1
                    ? ""
                    : "s"
            }`;


        /*
         * Display historical runs
         */
        runsEl.innerHTML =
            reports
                .map(item =>
                    renderRun(
                        item.filename,
                        item.report
                    )
                )
                .join("");


        /*
         * Latest report
         */
        const latest =
            reports[0];


        const latestMetrics =
            extractMetrics(
                latest.report
            );


        /*
         * Last run date
         */
        document.getElementById(
            "statDate"
        ).textContent =
            getReportDate(
                latest.filename
            );


        /*
         * Latest P95
         */
        document.getElementById(
            "statP95"
        ).textContent =
            `${latestMetrics.p95.toFixed(2)} ms`;


        /*
         * Latest error rate
         */
        const latestErrorRate =
            latestMetrics.failureRate * 100;


        document.getElementById(
            "statErr"
        ).textContent =
            `${latestErrorRate.toFixed(2)}%`;


        /*
         * Latest status
         */
        const status =
            getStatus(
                latestErrorRate
            );


        const statusElement =
            document.getElementById(
                "statStatus"
            );


        statusElement.textContent =
            STATUS_LABEL[status];


        statusElement.className =
            `value ${status}`;


        console.log(
            "k6 dashboard loaded successfully."
        );


    } catch (error) {

        console.error(error);


        runsEl.innerHTML =
            `<div class="empty">
                Couldn't load report history.
                <br><br>
                ${error.message}
            </div>`;

    }

}


document.addEventListener(
    "DOMContentLoaded",
    init
);