// InputTable.js
import PropTypes from 'prop-types';

export function InputTable({ rows, columns, onChange }) {
    return (
        <table>
        <thead>
            <tr>
            {columns.map((colName) => (
                <th key={colName}>{colName}</th>
            ))}
            </tr>
        </thead>
        <tbody>
            {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
                {columns.map((colName) => (
                <td key={colName}>
                    <input
                    type="text"
                    value={row[colName] || ''}
                    onChange={(e) => onChange(e.target.value, rowIndex, colName)}
                    />
                </td>
                ))}
            </tr>
            ))}
        </tbody>
        </table>
    );
}

// Prop Types for type validation
InputTable.propTypes = {
    rows: PropTypes.arrayOf(PropTypes.object).isRequired,
    columns: PropTypes.arrayOf(PropTypes.string).isRequired,
    onChange: PropTypes.func.isRequired,
};
