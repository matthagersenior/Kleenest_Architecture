import { getNavigationForWorkspace, resolveWorkspace } from '../../domain/workspaces.js';
export function resolveCanonicalWorkspaceNavigation({pathname='/',capabilities=[]}={}){const workspace=resolveWorkspace(pathname,capabilities);return Object.freeze({workspace,items:getNavigationForWorkspace(workspace,capabilities)});}
export function isCanonicalWorkspacePath(pathname='/',capabilities=[]){const result=resolveCanonicalWorkspaceNavigation({pathname,capabilities});return result.workspace!=='consumer'||String(pathname||'/')==='/';}
