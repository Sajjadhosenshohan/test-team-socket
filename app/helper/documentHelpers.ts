// helper/documentHelpers.ts
import { Document } from './socketHelpers';

export const selectDocument = (
    doc: Document, 
    setCurrentDoc: (doc: Document) => void,
    setComments: (comments: any[]) => void,
    setShowComments: (show: boolean) => void,
    loadedDocs: React.MutableRefObject<Set<string>>
) => {
    setCurrentDoc(doc);
    setComments([]);
    setShowComments(false);
    loadedDocs.current.delete(doc.id);
};

export const createNewDocument = async (
    title: string,
    createSolicitationDoc: (data: { title: string }) => Promise<any>,
    loadDocuments: () => Promise<void>,
    selectDocument: (doc: Document) => void,
    loadedDocs: React.MutableRefObject<Set<string>>,
    setNewDocTitle: (title: string) => void,
    setShowNewDoc: (show: boolean) => void
): Promise<void> => {
    if (!title.trim()) return;

    try {
        const result = await createSolicitationDoc({ title });
        if (result.success) {
            await loadDocuments();
            selectDocument(result.data);
            loadedDocs.current.add(result.data.id);
        }
    } catch (error) {
        console.error('Failed to create document:', error);
    } finally {
        setNewDocTitle('');
        setShowNewDoc(false);
    }
};