import angular from 'angular';

import { compose, convertKebabCaseToCamelCase } from '../common/utils';

export default function mockComponent(kebabCaseName) {
  const name = convertKebabCaseToCamelCase(kebabCaseName);

  function mock($provide) {
    $provide.decorator(`${name}Directive`, $delegate => {
      const component = $delegate[0];

      if (component.templateUrl) {
        delete component.templateUrl;
      }
      const template = `<!-- mock of ${kebabCaseName} -->`;
      component.template = template;

      component.controller = class {
        constructor() {
          mock._controller = this;
        }
      };

      mock._template = template;
      mock._name = kebabCaseName;

      return $delegate;
    });
  }

  angular.mock.module(mock);

  return withMethods(mock);
}

function withMethods(mock) {
  return compose(
    withExists,
    withProps,
    withProp,
    withSimulate,
  )(mock);
}

function withExists(mock) {
  mock.exists = () => !!mock._controller;
  return mock;
}

function withProps(mock) {
  mock.props = () => {
    const { controller, ...props } = mock._controller;
    return props;
  };
  return mock;
}

function withProp(mock) {
  mock.prop = key => mock._controller[key];
  return mock;
}

function withSimulate(mock) {
  mock.simulate = (event, data) => {
    const callbackName = `on${event[0].toUpperCase()}${event.slice(1)}`;
    mock._controller[callbackName](data);
    updateView();
    return mock;
  };
  return mock;
}

function updateView() {
  angular.mock.inject($injector => {
    $injector.get('$rootScope').$apply();
  });
}
