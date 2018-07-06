import schema from '../../renderer/schema';
import * as windshaftFiltering from './windshaft-filtering';

export function buildQuery(select, filters, source) {
    const columns = select.join();
    const relation = source._query ? `(${source._query}) as _cdb_query_wrapper` : source._tableName;
    const condition = filters ? windshaftFiltering.getSQLWhere(filters) : '';
    return `SELECT ${columns} FROM ${relation} ${condition}`;
}

export function buildSelectClause(MNS) {
    const columns = MNS.columns
        .map(name => schema.column.getBase(name))
        .concat(['the_geom', 'the_geom_webmercator', 'cartodb_id']);
    return columns.filter((item, pos) => columns.indexOf(item) == pos); // get unique values
}


export default {
    buildQuery,
    buildSelectClause
};
