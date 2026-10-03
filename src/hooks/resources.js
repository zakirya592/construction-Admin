import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/format";
function useCollection(key) {
    return useQuery({
        queryKey: [key],
        queryFn: async () => (await api.get(`/${key}`)).data,
    });
}
function useSaver(key, noun) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input) => {
            if (input.id) {
                const { id, ...body } = input;
                return (await api.patch(`/${key}/${id}`, body)).data;
            }
            return (await api.post(`/${key}`, input)).data;
        },
        onSuccess: (_data, variables) => {
            void queryClient.invalidateQueries({ queryKey: [key] });
            toast.success(variables.id ? `${noun} updated` : `${noun} added`);
        },
        onError: (error) => toast.error(errorMessage(error)),
    });
}
function useRemover(key, noun) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await api.delete(`/${key}/${id}`);
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: [key] });
            toast.success(`${noun} removed`);
        },
        onError: (error) => toast.error(errorMessage(error)),
    });
}
export const useProjects = () => useCollection("projects");
export const useCrew = () => useCollection("crew");
export const useEquipment = () => useCollection("equipment");
export const useMaterials = () => useCollection("materials");
export const useClients = () => useCollection("clients");
export const useInvoices = () => useCollection("invoices");
export const useLogs = () => useCollection("logs");
export const useSaveProject = () => useSaver("projects", "Project");
export const useDeleteProject = () => useRemover("projects", "Project");
export const useSaveCrew = () => useSaver("crew", "Crew member");
export const useDeleteCrew = () => useRemover("crew", "Crew member");
export const useSaveEquipment = () => useSaver("equipment", "Equipment");
export const useDeleteEquipment = () => useRemover("equipment", "Equipment");
export const useSaveMaterial = () => useSaver("materials", "Material");
export const useDeleteMaterial = () => useRemover("materials", "Material");
export const useSaveClient = () => useSaver("clients", "Client");
export const useDeleteClient = () => useRemover("clients", "Client");
export const useSaveInvoice = () => useSaver("invoices", "Invoice");
export const useDeleteInvoice = () => useRemover("invoices", "Invoice");
export const useSaveLog = () => useSaver("logs", "Daily log");
export const useDeleteLog = () => useRemover("logs", "Daily log");
