const {concat, Observable} = require('rxjs');
const { map, bufferCount} = require('rxjs/operators');
const date = require('date-and-time');

// ATTENZIONE ALLA TZ problema con il fatto che la stazione è in ora solare !! da sistemare
// i logger dovrebbero mandare i dati in UTC con la timezone settata invece qui è sempre un macello
function getFiveDaysSum (coll, updated) {
    const time = date.format(date.addDays(updated, -5), "YYYY-MM-DDTHH:mm:ssZ", true);
    const time1 = date.format(updated, "YYYY-MM-DDTHH:mm:ssZ", true);
    return getSum(coll, time, time1).pipe(map(res => ({res, type: "d5"})))
}
function getLast60Sum (coll, updated) {
    const time = date.format(date.addHours(updated, -1), "YYYY-MM-DDTHH:mm:ssZ", true);
    const time1 =  date.format(updated, "YYYY-MM-DDTHH:mm:ssZ", true);
    return getSum(coll, time, time1).pipe(map(res => ({res, type: "h1"})))
}
function getLast30Sum (coll, updated) {
    const time = date.format(date.addMinutes(updated, -30), "YYYY-MM-DDTHH:mm:ssZ", true);
    const time1 =  date.format(updated, "YYYY-MM-DDTHH:mm:ssZ", true);
    return getSum(coll, time, time1).pipe(map(res => ({res, type: "m30"})))
}
function getLast10Sum (coll, updated) {
    const time = date.format(date.addMinutes(updated, -10), "YYYY-MM-DDTHH:mm:ssZ", true);
    const time1 =  date.format(updated, "YYYY-MM-DDTHH:mm:ssZ", true);
    return getSum(coll, time, time1).pipe(map(res => ({res, type: "m10"})))
}
/**
 * 
 * @param {*} coll the collection to be queried
 * @param {*} startDate >= date requested
 * @param {*} endDate < date requested
 */
function getSum(coll, startDate, endDate) {
    return new Observable((observer) => {
        const cur = coll.aggregate([
            {$match: {$and: [{time:{ $gte:  startDate}}, {time:{ $lte:  endDate}}]}},
            {$group: {_id: null, sum: {$sum: {$arrayElemAt: [ "$inst", 4 ]}}, count: {$sum: 1}}},
            {$limit: 1}
        ])
        if (cur == null) {
            observer.error('null agg iterator')
        } else {
            cur.toArray(function(err, results) {
                if (err) {
                    observer.error(err)
                } else {
                    const [{sum, count} = {}] = results;
                    console.log(results)
                    observer.next({sum, count});
                    observer.complete();
                }
            });
        }
    });
}



module.exports = function getRainSum(coll) {
    const updated = new Date();
    const time = date.format(updated, "YYYY-MM-DDTHH:mm:ssZ", true);
    return concat( getFiveDaysSum(coll, updated), getLast60Sum(coll, updated), getLast30Sum(coll, updated), getLast10Sum(coll, updated)).pipe(bufferCount(), map(stats => ({stats, time})))

}