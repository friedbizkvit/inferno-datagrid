import createElement from 'inferno-create-element';
import Component from 'inferno-component';

export default (component) => class extends Component {
    constructor(props) {
        super(props);
        this.state = {
            scrollTop: 0
        };
        this.ref = element => this.setState({
            scrollTop: element.scrollTop
        });
        this.onScroll = e => this.setState({
            scrollTop: e.target.scrollTop
        });
    }

    render(props, { scrollTop }) {
        return (
            createElement('div', {
                style: { width: props.viewportWidth, height: props.viewportHeight, overflow: 'auto' },
                ref: this.ref,
                onScroll: this.onScroll
            }, [
                createElement(component, Object.assign({}, props, {
                    scrollTop
                }))
            ])
        );
    }
};
