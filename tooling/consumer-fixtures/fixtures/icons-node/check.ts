import { configureCelestialIcons, registerIconProvider, resolveIcon } from '@celestial-ui/icons';
import { LucideAdapter } from '@celestial-ui/icons/providers/lucide';

registerIconProvider(LucideAdapter);
configureCelestialIcons({ provider: 'lucide', missingIconPolicy: { kind: 'empty' } });

const result = resolveIcon({ name: 'search' });
if (result.status !== 'resolved' || !result.payload) {
  throw new Error('icons consumer failed to resolve search');
}

console.log('icons-node consumer OK');
