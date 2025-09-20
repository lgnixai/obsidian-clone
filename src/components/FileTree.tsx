import React, { useState, useCallback, useEffect } from 'react';
import { ChevronDown, ChevronUp, ChevronRight, File, Folder, FolderPlus, FilePlus, MoreHorizontal, Clock, Trash, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  fileType?: 'markdown' | 'database' | 'canvas' | 'html' | 'code';
  path: string;
  parentId?: string;
  children?: string[];
  isExpanded?: boolean;
  content?: string;
}

interface FileTreeProps {
  onFileSelect?: (file: FileItem) => void;
  selectedFileId?: string;
  onOpenRecent?: () => void;
}

const FileTree: React.FC<FileTreeProps> = ({ onFileSelect, selectedFileId, onOpenRecent }) => {
  const [files, setFiles] = useState<Record<string, FileItem>>({});
  const [rootItems, setRootItems] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedFiles = localStorage.getItem('obsidian-files');
    const savedRootItems = localStorage.getItem('obsidian-root-items');
    
    if (savedFiles && savedRootItems) {
      setFiles(JSON.parse(savedFiles));
      setRootItems(JSON.parse(savedRootItems));
    } else {
      // Initialize with default structure
      const defaultFiles: Record<string, FileItem> = {
        '1': {
          id: '1',
          name: '未命名',
          type: 'folder',
          path: '/未命名',
          children: ['2', '3', '4'],
          isExpanded: true
        },
        '2': {
          id: '2',
          name: '电池连接线企业调研笔记.md',
          type: 'file',
          fileType: 'markdown',
          path: '/未命名/电池连接线企业调研笔记.md',
          parentId: '1',
          content: '# 电池连接线企业调研笔记\n\n## 调研内容\n\n这里是调研的详细内容...'
        },
        '3': {
          id: '3',
          name: '电池新闻源',
          type: 'folder',
          path: '/未命名/电池新闻源',
          parentId: '1',
          children: [],
          isExpanded: false
        },
        '4': {
          id: '4',
          name: '国内电池连接器企业.md',
          type: 'file',
          fileType: 'markdown',
          path: '/未命名/国内电池连接器企业.md',
          parentId: '1',
          content: '# 国内电池连接器企业\n\n## 企业列表\n\n1. 企业A\n2. 企业B\n3. 企业C'
        },
        '5': {
          id: '5',
          name: '未命名 1',
          type: 'folder',
          path: '/未命名 1',
          children: ['6'],
          isExpanded: true
        },
        '6': {
          id: '6',
          name: '未命名',
          type: 'folder',
          path: '/未命名 1/未命名',
          parentId: '5',
          children: ['7', '8'],
          isExpanded: true
        },
        '7': {
          id: '7',
          name: '未命名.md',
          type: 'file',
          fileType: 'markdown',
          path: '/未命名 1/未命名/未命名.md',
          parentId: '6',
          content: '# 未命名\n\n现有架构痛点分析\n\n当前问题\n\n• 性能问题: 动态导入过多，启动速度受影响\n• 复杂依赖: tsyringe 依赖注入增加了学习成本\n• 状态管理: immer 和自定义状态管理可能不是最优解\n• 扩展机制: 扩展系统相对复杂，学习曲线陡峭\n• 构建系统: 构建流程有优化空间'
        },
        '8': {
          id: '8',
          name: '未命名 1.md',
          type: 'file',
          fileType: 'markdown',
          path: '/未命名 1/未命名/未命名 1.md',
          parentId: '6',
          content: '# 未命名 1\n\n这是另一个markdown文件的内容。'
        }
      };
      
      setFiles(defaultFiles);
      setRootItems(['1', '5']);
      
      // Save to localStorage
      localStorage.setItem('obsidian-files', JSON.stringify(defaultFiles));
      localStorage.setItem('obsidian-root-items', JSON.stringify(['1', '5']));
    }
  }, []);

  // Save to localStorage whenever files or rootItems change
  useEffect(() => {
    if (Object.keys(files).length > 0) {
      localStorage.setItem('obsidian-files', JSON.stringify(files));
      localStorage.setItem('obsidian-root-items', JSON.stringify(rootItems));
    }
  }, [files, rootItems]);

  const toggleExpand = useCallback((id: string) => {
    setFiles(prev => ({
      ...prev,
      [id]: { ...prev[id], isExpanded: !prev[id].isExpanded }
    }));
  }, []);

  const expandAllFolders = useCallback(() => {
    setFiles(prev => {
      const updated: Record<string, FileItem> = { ...prev };
      Object.values(updated).forEach(item => {
        if (item.type === 'folder') {
          updated[item.id] = { ...item, isExpanded: true };
        }
      });
      return updated;
    });
  }, []);

  const collapseAllFolders = useCallback(() => {
    setFiles(prev => {
      const updated: Record<string, FileItem> = { ...prev };
      Object.values(updated).forEach(item => {
        if (item.type === 'folder') {
          updated[item.id] = { ...item, isExpanded: false };
        }
      });
      return updated;
    });
  }, []);

  const createNewItem = useCallback((parentId: string | null, type: 'file' | 'folder', fileType?: 'markdown' | 'database' | 'canvas' | 'html' | 'code') => {
    const newId = Date.now().toString();
    const parentPath = parentId ? files[parentId].path : '';
    
    let defaultName = '新文件夹';
    let defaultContent = '';
    
    if (type === 'file') {
      switch (fileType) {
        case 'markdown':
          defaultName = '新文档.md';
          defaultContent = '# 新文档\n\n在这里开始编写...';
          break;
        case 'database':
          defaultName = '新数据库.db';
          defaultContent = JSON.stringify({ columns: ['ID', '名称', '类型'], rows: [] }, null, 2);
          break;
        case 'canvas':
          defaultName = '新画板.canvas';
          defaultContent = '';
          break;
        case 'html':
          defaultName = '新页面.html';
          defaultContent = '<!DOCTYPE html>\n<html>\n<head>\n    <title>Document</title>\n</head>\n<body>\n    <h1>Hello World!</h1>\n</body>\n</html>';
          break;
        case 'code':
          defaultName = '新代码.js';
          defaultContent = '// JavaScript 代码\nconsole.log("Hello World!");';
          break;
        default:
          defaultName = '新文件.md';
          defaultContent = '# 新文件\n\n在这里开始编写...';
          fileType = 'markdown';
      }
    }
    
    const newItem: FileItem = {
      id: newId,
      name: defaultName,
      type,
      fileType: type === 'file' ? fileType : undefined,
      path: `${parentPath}/${defaultName}`,
      parentId: parentId || undefined,
      children: type === 'folder' ? [] : undefined,
      isExpanded: type === 'folder' ? true : undefined,
      content: defaultContent || undefined
    };

    setFiles(prev => {
      const updated = { ...prev, [newId]: newItem };
      
      if (parentId) {
        // 确保父文件夹保持展开状态
        updated[parentId] = {
          ...updated[parentId],
          children: [...(updated[parentId].children || []), newId],
          isExpanded: true
        };
      }
      
      return updated;
    });

    if (!parentId) {
      setRootItems(prev => [...prev, newId]);
    }

    setEditingId(newId);
    setNewItemName(defaultName);
  }, [files]);

  const handleRename = useCallback((id: string, newName: string) => {
    if (!newName.trim()) return;
    
    setFiles(prev => {
      const target = prev[id];
      if (!target) return prev;
      const parentPath = target.parentId ? prev[target.parentId].path : '';
      const oldPath = target.path;
      const newPath = `${parentPath}/${newName}`;

      const updated: Record<string, FileItem> = { ...prev };
      updated[id] = { ...target, name: newName, path: newPath };

      if (target.type === 'folder' && target.children && target.children.length > 0) {
        const queue = [...target.children];
        while (queue.length) {
          const childId = queue.shift()!;
          const child = updated[childId];
          if (!child) continue;
          const childPath = child.path.replace(oldPath + '/', newPath + '/');
          updated[childId] = { ...child, path: childPath };
          if (child.type === 'folder' && child.children && child.children.length > 0) {
            queue.push(...child.children);
          }
        }
      }

      return updated;
    });
    
    setEditingId(null);
    setNewItemName('');
  }, []);

  const handleFileClick = useCallback((file: FileItem) => {
    if (file.type === 'file' && onFileSelect) {
      onFileSelect(file);
    } else if (file.type === 'folder') {
      toggleExpand(file.id);
    }
  }, [onFileSelect, toggleExpand]);

  const renderFileItem = useCallback((id: string, depth: number = 0): React.ReactNode => {
    const file = files[id];
    if (!file) return null;

    const isEditing = editingId === id;
    const isSelected = selectedFileId === id;

    return (
      <div key={id}>
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-1 hover:bg-accent/50 cursor-pointer group",
            isSelected && "bg-accent",
            "text-sm"
          )}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => !isEditing && handleFileClick(file)}
        >
          {file.type === 'folder' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(id);
              }}
            >
              {file.isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          )}
          
          {file.type === 'folder' ? (
            <Folder className="h-4 w-4 text-muted-foreground" />
          ) : (
            <File className="h-4 w-4 text-muted-foreground" />
          )}

          {isEditing ? (
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onBlur={() => handleRename(id, newItemName)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRename(id, newItemName);
                } else if (e.key === 'Escape') {
                  setEditingId(null);
                  setNewItemName('');
                }
              }}
              className="h-5 px-1 text-xs"
              autoFocus
            />
          ) : (
            <span className="flex-1 truncate text-foreground">{file.name}</span>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                setEditingId(id);
                setNewItemName(file.name);
              }}>
                重命名
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); const item = files[id]; if (item?.path) navigator.clipboard.writeText(item.path); }}>
                <div className="flex items-center gap-2"><Copy className="h-3 w-3" />复制路径</div>
              </DropdownMenuItem>
              {file.type === 'folder' && (
                <>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); createNewItem(id, 'file', 'markdown'); }}>
                    新建Markdown文档
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); createNewItem(id, 'file', 'database'); }}>
                    新建数据库
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); createNewItem(id, 'file', 'canvas'); }}>
                    新建画图
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); createNewItem(id, 'file', 'html'); }}>
                    新建HTML
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); createNewItem(id, 'file', 'code'); }}>
                    新建代码
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); createNewItem(id, 'folder'); }}>
                    新建文件夹
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setFiles(prev => { const updated = { ...prev }; const remove = (rid: string) => { const n = updated[rid]; if (!n) return; if (n.type === 'folder' && n.children) { n.children.forEach(remove); } delete updated[rid]; }; const t = updated[id]; if (t?.parentId && updated[t.parentId]) { const p = updated[t.parentId]; updated[t.parentId] = { ...p, children: (p.children || []).filter(cid => cid !== id) }; } remove(id); return updated; }); setRootItems(prev => prev.filter(rid => rid !== id)); }}>
                <div className="flex items-center gap-2 text-destructive"><Trash className="h-3 w-3" />删除</div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {file.type === 'folder' && file.isExpanded && file.children && (
          <div>
            {([...file.children]
              .sort((a, b) => {
                const A = files[a];
                const B = files[b];
                if (!A || !B) return 0;
                if (A.type !== B.type) return A.type === 'folder' ? -1 : 1;
                return A.name.localeCompare(B.name, 'zh-CN');
              })
            ).map(childId => renderFileItem(childId, depth + 1))}
          </div>
        )}
      </div>
    );
  }, [files, editingId, selectedFileId, newItemName, handleFileClick, toggleExpand, handleRename, createNewItem]);

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      <div className="flex items-center justify-between p-2 border-b border-border">
        <span className="text-sm font-medium text-foreground">文件</span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => createNewItem(null, 'file', 'markdown')}
          >
            <FilePlus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => createNewItem(null, 'folder')}
          >
            <FolderPlus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={expandAllFolders}
            title="展开全部"
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={collapseAllFolders}
            title="折叠全部"
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onOpenRecent && onOpenRecent()}
            title="近期文件"
          >
            <Clock className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {rootItems.map(id => renderFileItem(id))}
      </div>
    </div>
  );
};

export default FileTree;