import {CfbColumnTitleElement} from '@rinkkasatiainen/cfb-session-discovery/dist/src/loads-sections/components/cfb-column-title'

export function render(args) {
  const element = document.createElement(CfbColumnTitleElement.elementName)
  if (args.name) {
    element.setAttribute('data-name', args.name)
  }
  return element
}
