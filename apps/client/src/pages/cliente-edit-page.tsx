import { IconArrowLeft } from "@tabler/icons-react";
import { useState } from "react";
import {
	Navigate,
	useLocation,
	useNavigate,
	useParams,
} from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
	CustomerForm,
	type CustomerFormSubmitData,
} from "@/modules/customers/components/customer-form.js";
import { useUpdateCustomer } from "@/modules/customers/hooks/use-customers.js";
import type { Customer } from "@/modules/customers/types/api.js";

export function ClienteEditPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const location = useLocation();
	const customer = location.state?.customer as Customer | undefined;

	const updateCustomer = useUpdateCustomer();
	const [formError, setFormError] = useState<string | null>(null);

	if (!id || !customer || customer.id !== id) {
		return <Navigate to="/clientes" replace />;
	}

	const customerId = id;

	function goBack() {
		navigate("/clientes");
	}

	function onSubmit(data: CustomerFormSubmitData) {
		setFormError(null);
		updateCustomer.mutate(
			{ id: customerId, data },
			{
				onSuccess: () => navigate("/clientes"),
				onError: (error) => setFormError(error.message),
			},
		);
	}

	return (
		<div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
			<div className="flex flex-col gap-3">
				<Button
					type="button"
					variant="ghost"
					className="cursor-pointer w-fit gap-2 -ml-2 text-muted-foreground"
					onClick={goBack}
				>
					<IconArrowLeft className="size-4" />
					Volver al listado
				</Button>
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">
						Editar cliente
					</h1>
					<p className="text-muted-foreground text-sm">
						Modifica los datos de {customer.fullName}.
					</p>
				</div>
			</div>

			<CustomerForm
				active
				customer={customer}
				onSubmit={onSubmit}
				onCancel={goBack}
				errorMessage={formError}
				isLoading={updateCustomer.isPending}
				idPrefix="customer-edit"
			/>
		</div>
	);
}
