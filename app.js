$(function () {
    const buildZone = function (name, lowHr, highHr) {
        return {
            name: name,
            lowHr: lowHr,
            highHr: highHr,
        }
    };

    const drawZone = function (container, zone) {
        const row = $("<tr/>")
            .append($("<td/>", {text: zone.name}))
            .append($("<td/>", {text: zone.lowHr}))
            .append($("<td/>", {text: zone.highHr > 0 ? zone.highHr : "Max"}));

        $(container).append(row);
    };

    const calcZones = function (aet, ant, hrmax) {
        return [
            buildZone("Recovery", 0, calcPercentage(aet, 80)),
            buildZone("Z1", calcPercentage(aet, 80) + 1, calcPercentage(aet, 90)),
            buildZone("Z2", calcPercentage(aet, 90) + 1, calcPercentage(aet, 100)),
            buildZone("Z3", calcPercentage(aet, 100) + 1, calcPercentage(ant, 100)),
            buildZone("Z4", calcPercentage(ant, 100) + 1, calcPercentage(hrmax, 100)),
        ]
    };

    const calcPercentage = function (num, percent) {
        return Math.floor((percent / 100) * num);
    };

    const calcDiffPercent = function (n1, n2) {
        return Math.round(((n2 - n1) / n2) * 100);
    };

    // Form stuff

    const resultsContainer = $("#results");

    const handleInput = function (aet, ant, hrmax) {
        trackSubmit(aet, ant, hrmax);

        const zonesContainer = $("<table/>", {
            "id": "zones",
            "class": "table table-striped",
        });
        resultsContainer.empty();
        resultsContainer.append(zonesContainer);

        const zones = calcZones(aet, ant, hrmax);
        zones.forEach(function (zone) {
            drawZone(zonesContainer, zone);
        });

        const aetDiff = calcDiffPercent(aet, ant);
        const isAerobicDeficient = aetDiff > 10.0;
        const adsMsg = isAerobicDeficient ?
            `Your current AnT/AeT diff is ${aetDiff}% suggesting that you might suffer from ADS. You can gain from mainly training in Z2 (just under AeT) until this value is below 10%.` :
            `Your current AnT/AeT diff is ${aetDiff}%. You can benefit from higher intensity workouts.`;
        const alertClass = isAerobicDeficient ? "alert-warning" : "alert-success";

        const alertDiv = $("<div/>", {
            "class": "alert " + alertClass,
            "role": "alert",
        });

        alertDiv.append($("<h4/>", {"class": "alert-heading"})
            .append($("<a/>", {
                "href": "https://www.uphillathlete.com/diy-anaerobic-test/",
                "target": "_blank",
                "text": "The 10 Percent Test"
            })));

        alertDiv.append($("<p/>", {
            "class": "mb-0",
            "text": adsMsg,
        }));

        if (isAerobicDeficient) {
            alertDiv.append($("<a/>", {
                "href": "https://www.uphillathlete.com/aerobic-deficiency-syndrome/",
                "target": "_blank",
                "text": "Aerobic Deficiency Syndrome (ADS)",
            }));
        }

        resultsContainer.append(alertDiv);
    };

    const configureValidation = function () {
        const aet = $("#aet");
        const ant = $("#ant");
        const hrmax = $("#hrmax");

        // Allow 0 to be used if max HR is unknown
        ant.attr("max", hrmax.val() > 0 ? hrmax.val() : null);
        aet.attr("max", ant.val());
    };

    $('#uphill-form input').on("keyup", function (e) {
        configureValidation()
    });

    $('#uphill-form').on('submit', function (e) {
        e.preventDefault();
        configureValidation();

        const aet = $("#aet").val();
        const ant = $("#ant").val();
        const hrmax = $("#hrmax").val();

        if (aet > 0 && ant > 0) {
            handleInput(aet, ant, hrmax);
        }

        return false;
    });

    const isAnalyticsAvailable = function() {
        return typeof ga === 'function';
    }

    const initAnalytics = function() {
        if (isAnalyticsAvailable()) {
            ga('create', 'UA-59609997-2', 'auto', 'hrTracker');
        }
    };

    const trackSubmit = function(aet, ant, hrmax) {
        if (isAnalyticsAvailable()) {
            let url = document.location.pathname + `?hrmax=${hrmax}&ant=${ant}&aet=${aet}`
            ga('hrTracker.send', 'pageview', url);
        }
    };

    initAnalytics();
});
