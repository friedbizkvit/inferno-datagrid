import createElement from 'inferno-create-element';
import { shouldUpdate, withMiddleState } from './hoc/index.js';
import { compose, getVisibleRows, getKeysByIndex } from './utils/index.js';

const Container = ({ height, renderedTop, children }) => (
    <div style={{ position: 'relative', height }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: renderedTop }}>
            {children}
        </div>
    </div>
);

const RowWrapper = shouldUpdate((props, nextProps) =>
    props.height !== nextProps.height ||
    props.component !== nextProps.component ||
    props.datum !== nextProps.datum
)(({ height, datum, index, component: Row }) =>
    <div style={{ height }}>
        <Row datum={datum} index={index} />
    </div>
);

const List = ({ data, rowHeight, component, start, end, keys }) => (
    <Container height={data.length * rowHeight} renderedTop={start * rowHeight}>
        {data.slice(start, end).map((datum, index) =>
            <RowWrapper
                key={keys[start + index]}
                height={rowHeight}
                index={start + index}
                datum={datum}
                component={component}
            />
        )}
    </Container>
);

export default compose(
    withMiddleState((props, state = {}) => {
        const [start, end] = getVisibleRows({
            scrollTop: props.scrollTop,
            viewportHeight: props.viewportHeight,
            rowHeight: props.rowHeight,
            rowsCount: props.data.length
        });
        return {
            start,
            end,
            keys: getKeysByIndex(state.keys, start, end)
        };
    }),
    shouldUpdate((props, nextProps) =>
        props.start !== nextProps.start ||
        props.end !== nextProps.end ||
        props.data !== nextProps.data ||
        props.rowHeight !== nextProps.rowHeight ||
        props.component !== nextProps.component
    )
)(List);
