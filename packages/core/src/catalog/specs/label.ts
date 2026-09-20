import { defineComponentSpec } from '../../spec/spec';
import { finalizeReferenceContract, referenceContractBase } from './_shared';

export const labelSpec = defineComponentSpec({
  contract: finalizeReferenceContract({
    ...referenceContractBase('label'),
    props: {
      props: {
        htmlFor: { name: 'htmlFor', type: 'string', mapsTo: 'native' },
      },
      nativePassthrough: 'root',
    },
    parts: {
      parts: {
        root: { name: 'root', required: true, refTarget: true, receivesNativeProps: true },
      },
    },
    accessibility: {
      name: { from: 'contents' },
    },
    polymorphism: {
      nativeTag: 'label',
    },
    refs: {
      primary: 'root',
      targets: { root: { part: 'root' } },
    },
  }),
  metadata: {
    displayName: 'Label',
    purpose: 'Accessible label for a form control.',
    status: 'stable',
    taxonomy: 'atomic',
    engineeringFamily: 'forms',
    complexity: 'simple',
    capabilities: [
      'identity',
      'props',
      'parts',
      'accessibility',
      'polymorphism',
      'refs',
    ],
  },
  environment: { ssr: true, browser: true },
});
