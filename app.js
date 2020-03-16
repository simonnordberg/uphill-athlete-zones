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

    const calcZones = function (maxHr, aetHr, antHr) {
        return [
            buildZone("Recovery", 0, calcPercentage(aetHr, 80)),
            buildZone("Z1", calcPercentage(aetHr, 80) + 1, calcPercentage(aetHr, 90)),
            buildZone("Z2", calcPercentage(aetHr, 90) + 1, calcPercentage(aetHr, 100)),
            buildZone("Z3", calcPercentage(aetHr, 100) + 1, calcPercentage(antHr, 100)),
            buildZone("Z4", calcPercentage(antHr, 100) + 1, calcPercentage(maxHr, 100)),
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

    const handleInput = function (maxHr, aetHr, antHr) {
        const zonesContainer = $("<table/>", {
            "id": "zones",
            "class": "table table-striped",
        });
        resultsContainer.empty();
        resultsContainer.append(zonesContainer);

        const zones = calcZones(maxHr, aetHr, antHr);
        zones.forEach(function (zone) {
            drawZone(zonesContainer, zone);
        });

        const aetDiff = calcDiffPercent(aetHr, antHr);
        const isAerobicDeficient = aetDiff > 10.0;
        const adsMsg = isAerobicDeficient ?
            `Your current AnT/AeT diff is ${aetDiff}% suggesting that you might suffer from ADS. You can gain from mainly training in Z2 (just under AeT) until this value is below 10%.` :
            `Your current AnT/AeT diff is ${aetDiff}%. You can benefit from higher intensity workouts.`;
        const alertClass = isAerobicDeficient ? "alert-warning" : "alert-success";

        let alertDiv = $("<div/>", {
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

    const initValidation = function () {
        const aetInput = $("#inputAetHr");
        const antInput = $("#inputAntHr");
        const maxHrInput = $("#inputMaxHr");

        // Allow 0 to be used if max HR is unknown
        antInput.attr("max", maxHrInput.val() > 0 ? maxHrInput.val() : null);
        aetInput.attr("max", antInput.val());
    };

    $('#uphill-form input').on("keyup", function (e) {
        initValidation()
    });

    $('#uphill-form').on('submit', function (e) {
        const aetHr = $("#inputAetHr").val();
        const antHr = $("#inputAntHr").val();
        const maxHr = $("#inputMaxHr").val();

        initValidation();
        handleInput(maxHr, aetHr, antHr);

        return false;
    });
});
