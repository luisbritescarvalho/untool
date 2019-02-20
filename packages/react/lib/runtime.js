'use strict';
/* global __webpack_modules__, __webpack_require__ */

const { isValidElement, createElement, Component } = require('react');
const { default: withRouter } = require('react-router-dom/es/withRouter');
const isPlainObject = require('is-plain-object');
const PropTypes = require('prop-types');

const {
  initialize,
  internal: { invariant },
} = require('@untool/core');

exports.render = (element, options) => (...args) => {
  invariant(
    isValidElement(element),
    'render(): Received invalid React element'
  );
  invariant(
    options === undefined || isPlainObject(options),
    'render(): Received invalid options'
  );
  const { render } = initialize({}, element, options);
  invariant(render, "Can't use @untool/react mixin");
  return render(...args);
};

const Miss = ({ staticContext }) => {
  if (staticContext) {
    staticContext.miss = true;
  }
  return null;
};
Miss.propTypes = {
  staticContext: PropTypes.object,
};
exports.Miss = withRouter(Miss);

const Status = ({ staticContext, code }) => {
  if (staticContext) {
    staticContext.status = code;
  }
  return null;
};
Status.propTypes = {
  staticContext: PropTypes.object,
  code: PropTypes.number.isRequired,
};
exports.Status = withRouter(Status);

const Header = ({ staticContext, name = '', value = '' }) => {
  if (staticContext) {
    staticContext.headers = { ...staticContext.headers, [name]: value };
  }
  return null;
};
Header.propTypes = {
  staticContext: PropTypes.object,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};
exports.Header = withRouter(Header);

exports.importComponent = ({ load, moduleId }, name = 'default') => {
  class Importer extends Component {
    constructor({ staticContext }) {
      super();
      if (staticContext) {
        staticContext.modules.push(moduleId);
      }
      if (staticContext || __webpack_modules__[moduleId]) {
        this.state = { Component: __webpack_require__(moduleId)[name] };
      } else {
        this.state = { loading: true };
      }
    }
    componentDidMount() {
      const { loader } = this.props;
      const { loading } = this.state;
      if (loading) {
        const state = { Component: null, error: null, loading: false };
        Promise.resolve()
          .then(() => (loader ? loader(load) : load()))
          .then(
            ({ [name]: Component }) => this.setState({ ...state, Component }),
            (error) => this.setState({ ...state, error })
          );
      }
    }
    render() {
      const {
        render = ({ Component, error, loading, ...props }) => {
          return !(error || loading) ? createElement(Component, props) : null;
        },
        ownProps,
      } = this.props;
      return render({ ...ownProps, ...this.state });
    }
  }
  Importer.propTypes = {
    staticContext: PropTypes.object,
    ownProps: PropTypes.object.isRequired,
    loader: PropTypes.func,
    render: PropTypes.func,
  };
  const ImporterWithRouter = withRouter(Importer);
  return function Import({ loader, render, ...ownProps }) {
    return createElement(ImporterWithRouter, { loader, render, ownProps });
  };
};
