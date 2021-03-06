import createElement from 'inferno-create-element';
import Component from 'inferno-component';
import { bisectColumns, findColumn, trimColumnWidth } from './utils/index.js';
import { draggable } from './hoc/index.js';

const dragOffset = 3;

const Container = ({ children }) => (
    <div style={{ display: 'flex', position: 'relative', height: 'inherit' }}>
        {children}
    </div>
);

const Resizer = ({ last }) => (
    <div style={{
        position: 'absolute',
        zIndex: 2,
        top: 0,
        bottom: 0,
        right: last ? 0 : -dragOffset,
        width: last ? dragOffset : dragOffset * 2,
        cursor: 'col-resize'
    }}>
    </div>
);

const ColumnWrapper = ({ column, index, last, component: Column }) => (
    <div style={{ position: 'relative', width: column.width, height: 'inherit' }}>
        <Column column={column} index={index} last={last} ghost={false} />
        {column.enableResizing && <Resizer last={last} />}
    </div>
);

const ColumnGhost = ({ x, column, index, component: Column }) => (
    <div style={{ position: 'absolute', transform: `translateX(${x}px)`, width: column.width, height: 'inherit' }}>
        <Column column={column} index={index} last={false} ghost={true} />
    </div>
);

const dragMove = ({ columns, x, dx, onResizing, onMoving }) => {
    const [startIndex, startX] = findColumn(columns, x - dx);
    const startColumn = columns[startIndex];
    if (Math.abs(startX) <= dragOffset) {
        // resize previous
        // skip first to not conflict with pinned tables with moving
        if (startIndex !== 0) {
            const prevColumn = columns[startIndex - 1];
            if (prevColumn.enableResizing) {
                onResizing(prevColumn.name, x);
            }
        }
    } else if (Math.abs(startX - startColumn.width) <= dragOffset) {
        // resize current
        if (startColumn.enableResizing) {
            onResizing(startColumn.name, x);
        }
    } else if (startColumn.enableMoving) {
        // move current
        const [leftIndex, rightIndex] = bisectColumns(columns, x - startX);
        onMoving(
            startColumn.name,
            leftIndex === -1 ? null : columns[leftIndex].name,
            rightIndex === -1 ? null : columns[rightIndex].name
        );
        return {
            moving: true,
            movingPosition: x - startX,
            movingColumn: startColumn,
            movingIndex: startIndex
        };
    }
};

const dragEnd = ({ columns, x, dx, onResize, onMove }) => {
    const [startIndex, startX] = findColumn(columns, x - dx);
    const startColumn = columns[startIndex];
    if (Math.abs(startX) <= dragOffset) {
        // resize previous
        // skip first to not conflict with pinned tables with moving
        if (startIndex !== 0) {
            const prevColumn = columns[startIndex - 1];
            if (prevColumn.enableResizing) {
                onResize(prevColumn.name, trimColumnWidth(prevColumn, prevColumn.width + startX + dx));
            }
        }
    } else if (Math.abs(startX - startColumn.width) <= dragOffset) {
        // resize current
        if (startColumn.enableResizing) {
            onResize(startColumn.name, trimColumnWidth(startColumn, startX + dx));
        }
    } else if (startColumn.enableMoving) {
        // move current
        const [leftIndex, rightIndex] = bisectColumns(columns, x - startX);
        onMove(
            startColumn.name,
            leftIndex === -1 ? null : columns[leftIndex].name,
            rightIndex === -1 ? null : columns[rightIndex].name
        );
        return {
            moving: false
        };
    }
};

export default draggable({
    offset: dragOffset,
    style: { height: 'inherit'}
})(class Header extends Component {
    componentWillReceiveProps(nextProps) {
        if (this.props.dragging && this.props.x !== nextProps.x) {
            this.setState(dragMove(nextProps));
        }
        if (!nextProps.dragging && this.props.dragging !== nextProps.dragging) {
            this.setState(dragEnd(nextProps));
        }
    }

    render({ columns, component }, { moving, movingColumn, movingIndex, movingPosition }) {
        return (
            <Container>
                {columns.map((column, index) =>
                    <ColumnWrapper
                        key={column.name}
                        column={column}
                        index={index}
                        last={index === columns.length - 1}
                        component={component}
                    />
                )}
                {moving &&
                    <ColumnGhost
                        x={movingPosition}
                        column={movingColumn}
                        index={movingIndex}
                        component={component}
                    />
                }
            </Container>
        );
    }
});
