'use client'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/formatter'
import { Switch } from '@/components/ui/switch'
import {
	AlertCircle,
	ArrowLeft,
	CircleCheck,
	CircleX,
	Heart,
	Home,
	Plus,
	Star,
	Trash,
	X,
	Check,
	ChevronsUpDown,
} from 'lucide-react'
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselPrevious,
	CarouselNext,
	type CarouselApi,
} from '@/components/ui/carousel'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { createProduct } from '@/actions/products/createProduct'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'

const FormSchema = z.object({
	name: z.string().min(1, 'Name is required').max(200),
	slug: z.string(),
	description: z.string().min(1, 'Description is required').max(15000),
	images: z
		.array(z.string().url('Invalid URL'))
		.min(1, 'At least one image is required')
		.max(15),
	price: z
		.string()
		.min(1, 'Price is required')
		.max(99999)
		.regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
	sale_price: z.string().max(99999).nullable(),
	stock_quantity: z.number().int().min(0, 'Stock cannot be negative').max(999),
	purchase_note: z.string().max(200).optional(),
	visible: z.boolean(),
	purchasable: z.boolean(),
	reviews_allowed: z.boolean(),
	featured: z.boolean(),
	categories: z.array(z.number()).min(1, 'At least one category is required'),
})

export default function Create({ categories }: { categories: Category[] }) {
	const router = useRouter()
	const [activeTab, setActiveTab] = useState('edit')
	const [activeIndex, setActiveIndex] = useState(0)
	const [api, setApi] = useState<CarouselApi>()

	useEffect(() => {
		if (!api) {
			return
		}

		api.on('select', () => {
			setActiveIndex(api.selectedScrollSnap())
		})
	}, [api])

	const scrollTo = useCallback(
		(index: number) => {
			api?.scrollTo(index)
		},
		[api]
	)

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			name: '',
			slug: '',
			description: '',
			images: [''],
			price: '0.00',
			sale_price: null,
			stock_quantity: 0,
			purchase_note: '',
			visible: true,
			purchasable: true,
			reviews_allowed: true,
			featured: false,
			categories: [],
		},
	})

	const flattenedImages = form
		.watch('images')
		.map((image: string, i: number) => ({
			src: image,
			alt: form.watch('slug'),
			index: i,
		}))

	const addImage = () => {
		const currentImages = form.getValues('images')
		form.setValue('images', [...currentImages, ''])
	}

	const deleteImage = (index: number) => {
		const currentImages = form.getValues('images')
		if (currentImages.length > 1) {
			form.setValue(
				'images',
				currentImages.filter((_, i) => i !== index)
			)
		}
	}

	const discount = form.watch('sale_price')
		? Math.round(
				((Number(form.watch('price')) - Number(form.watch('sale_price'))) /
					Number(form.watch('price'))) *
					100
		  )
		: 0

	useEffect(() => {
		form.watch((value, { name }) => {
			if (name === 'name') {
				form.setValue('slug', value.name?.toLowerCase().replace(/ /g, '-') || '')
			}
		})
	}, [form])

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		const productData = {
			...data,
			images: data.images.map((url: string) => ({
				id: 0,
				alt: data.slug,
				src: [url],
				createdAt: new Date(),
				updatedAt: new Date(),
				productsId: 0,
			})),
			categories: data.categories.map((id: number) => {
				const category = categories.find(c => c.id === id)
				return {
					id: category?.id || 0,
					name: category?.name || '',
					slug: category?.slug || '',
					createdAt: category?.createdAt || new Date(),
					updatedAt: category?.updatedAt || new Date(),
				}
			}),
			id: 0,
			tags: [],
			specifications: [],
			reviews: [],
			orders: [],
			wishlist: [],
			createdAt: new Date(),
			updatedAt: new Date(),
			purchase_note: data.purchase_note || null,
		}

		await createProduct(productData)
		router.push('/products')
		toast.success('Product created successfully')
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-6 flex items-center">
				<Button size="icon" asChild className="rounded-full mr-4">
					<Link href={'/admin'}>
						<ArrowLeft className="size-5" />
					</Link>
				</Button>
				<h1 className="text-3xl font-bold">Create Product</h1>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid w-full grid-cols-2 mb-6">
					<TabsTrigger value="edit">Edit</TabsTrigger>
					<TabsTrigger value="preview">Preview</TabsTrigger>
				</TabsList>
				<TabsContent value="edit">
					<ScrollArea className="h-[calc(100vh-200px)] pr-4">
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
								<Card>
									<CardHeader>
										<CardTitle>Basic Information</CardTitle>
									</CardHeader>
									<CardContent className="space-y-6">
										<FormField
											control={form.control}
											name="categories"
											render={({ field }) => (
												<FormItem className="flex flex-col">
													<FormLabel>Categories</FormLabel>
													<Popover>
														<PopoverTrigger asChild>
															<FormControl>
																<Button
																	variant="outline"
																	role="combobox"
																	className={cn(
																		'w-full justify-between',
																		!field.value.length && 'text-muted-foreground'
																	)}
																>
																	{field.value.length > 0
																		? `${field.value.length} categories selected`
																		: 'Select categories'}
																	<ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
																</Button>
															</FormControl>
														</PopoverTrigger>
														<PopoverContent className="w-full p-0">
															<Command>
																<CommandInput placeholder="Search categories..." />
																<CommandList>
																	<CommandEmpty>No categories found.</CommandEmpty>
																	<CommandGroup>
																		{categories.map(category => (
																			<CommandItem
																				key={category.id}
																				onSelect={() => {
																					const updatedCategories = field.value.includes(category.id)
																						? field.value.filter((id: number) => id !== category.id)
																						: [...field.value, category.id]
																					form.setValue('categories', updatedCategories)
																				}}
																			>
																				<Check
																					className={cn(
																						'mr-2 size-4',
																						field.value.includes(category.id)
																							? 'opacity-100'
																							: 'opacity-0'
																					)}
																				/>
																				{category.name}
																			</CommandItem>
																		))}
																	</CommandGroup>
																</CommandList>
															</Command>
														</PopoverContent>
													</Popover>
													<div className="flex flex-wrap gap-2 mt-2">
														{field.value.map((category_id: number, index: number) => {
															const category = categories.find(c => c.id === category_id)
															return (
																<Button
																	key={category_id}
																	variant="secondary"
																	size="sm"
																	className={`${
																		index === 0
																			? 'dark:bg-orange-600 dark:hover:bg-orange-700 bg-orange-400 hover:bg-orange-500'
																			: ''
																	}`}
																	onClick={() => {
																		const updatedCategories = field.value.filter(
																			(id: number) => id !== category_id
																		)
																		form.setValue('categories', updatedCategories)
																	}}
																>
																	{category?.name}
																	<X className="ml-2 h-3 w-3" />
																</Button>
															)
														})}
													</div>
													<FormMessage />
												</FormItem>
											)}
										/>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<FormField
												control={form.control}
												name="name"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Name</FormLabel>
														<FormControl>
															<Input {...field} maxLength={199} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="slug"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Slug</FormLabel>
														<FormControl>
															<Input {...field} disabled />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>

										<FormField
											control={form.control}
											name="description"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Description</FormLabel>
													<FormControl>
														<Textarea {...field} rows={5} maxLength={15000} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Images</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="flex gap-1 text-xs text-gray-600 dark:text-gray-400 items-center mb-4">
											<AlertCircle className="size-4 text-orange-600" />
											<span>
												Only upload images from{' '}
												<Link
													href={'https://postimages.org/'}
													target="_blank"
													className="underline"
												>
													postimages.org
												</Link>{' '}
												(direct link)
											</span>
										</div>
										{form.watch('images').map((_, index) => (
											<FormField
												key={index}
												control={form.control}
												name={`images.${index}`}
												render={({ field }) => (
													<FormItem className="flex items-center gap-2 space-y-0">
														<FormControl>
															<div className="flex items-center gap-2 w-full">
																<Badge
																	variant="secondary"
																	className="size-10 flex justify-center items-center text-base rounded-md"
																>
																	{index + 1}
																</Badge>
																<Input {...field} className="flex-grow" />
															</div>
														</FormControl>
														{index > 0 && (
															<Button
																size="icon"
																variant="destructive"
																onClick={() => deleteImage(index)}
																type="button"
															>
																<Trash className="size-4" />
															</Button>
														)}
														<FormMessage />
													</FormItem>
												)}
											/>
										))}
										<Button
											variant="secondary"
											onClick={addImage}
											type="button"
											className="w-full mt-2"
											disabled={form.watch('images').length >= 15}
										>
											<Plus className="mr-2 size-4" /> Add Image
										</Button>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Pricing and Inventory</CardTitle>
									</CardHeader>
									<CardContent className="space-y-6">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<FormField
												control={form.control}
												name="price"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Price</FormLabel>
														<FormControl>
															<Input
																{...field}
																type="number"
																step="0.01"
																max={99999}
																value={field.value ?? ''}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="sale_price"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Sale Price</FormLabel>
														<FormControl>
															<Input
																{...field}
																type="number"
																step="0.01"
																max={99999}
																value={field.value ?? ''}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>

										<FormField
											control={form.control}
											name="stock_quantity"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Stock</FormLabel>
													<FormControl>
														<Input
															{...field}
															type="number"
															onChange={e => field.onChange(parseInt(e.target.value))}
															max={999}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="purchase_note"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Purchase Note</FormLabel>
													<FormControl>
														<Input {...field} maxLength={200} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Product Settings</CardTitle>
									</CardHeader>
									<CardContent className="space-y-6">
										<FormField
											control={form.control}
											name="visible"
											render={({ field }) => (
												<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
													<div className="space-y-0.5">
														<FormLabel className="text-base">Visible</FormLabel>
														<FormDescription>
															Make the product visible for users.
														</FormDescription>
													</div>
													<FormControl>
														<Switch checked={field.value} onCheckedChange={field.onChange} />
													</FormControl>
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="purchasable"
											render={({ field }) => (
												<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
													<div className="space-y-0.5">
														<FormLabel className="text-base">Purchasable</FormLabel>
														<FormDescription>Make the product purchasable.</FormDescription>
													</div>
													<FormControl>
														<Switch checked={field.value} onCheckedChange={field.onChange} />
													</FormControl>
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="reviews_allowed"
											render={({ field }) => (
												<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
													<div className="space-y-0.5">
														<FormLabel className="text-base">Reviews</FormLabel>
														<FormDescription>
															Allow user reviews for this product.
														</FormDescription>
													</div>
													<FormControl>
														<Switch checked={field.value} onCheckedChange={field.onChange} />
													</FormControl>
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="featured"
											render={({ field }) => (
												<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
													<div className="space-y-0.5">
														<FormLabel className="text-base">Featured</FormLabel>
														<FormDescription>
															Feature this product on the frontpage.
														</FormDescription>
													</div>
													<FormControl>
														<Switch checked={field.value} onCheckedChange={field.onChange} />
													</FormControl>
												</FormItem>
											)}
										/>
									</CardContent>
								</Card>

								<Button type="submit" className="w-full">
									Create Product
								</Button>
							</form>
						</Form>
					</ScrollArea>
				</TabsContent>
				<TabsContent className="p-4" value="preview">
					<ScrollArea className="h-[calc(100vh-200px)] pr-4">
						{!form.watch('visible') ? (
							<Alert className="mb-6">
								<AlertTitle>⚠️ This product is currently hidden.</AlertTitle>
								<AlertDescription>
									Only admins can currently view this product.
								</AlertDescription>
							</Alert>
						) : null}

						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbLink className="cursor-pointer">
										<Home className="size-5" />
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator />
								<BreadcrumbItem>
									<BreadcrumbLink className="cursor-pointer">Products</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator />
								<BreadcrumbItem>
									<BreadcrumbPage className="max-w-48 truncate">Category</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>

						<div className="grid md:grid-cols-2 gap-8 mt-10">
							<div>
								<Carousel setApi={setApi} className="w-full">
									<CarouselContent>
										{flattenedImages.map((image, i) => (
											<CarouselItem key={i} className="flex justify-center">
												<div className="relative aspect-square w-full max-w-[300px] md:max-w-full">
													<img
														src={image.src}
														alt={image.alt}
														className="object-contain h-full w-full flex items-center justify-center text-xl"
													/>
												</div>
											</CarouselItem>
										))}
									</CarouselContent>
									<ScrollArea className="w-full whitespace-nowrap rounded-md border mt-4">
										<div className="flex max-w-sm space-x-2 p-2">
											{flattenedImages.map((image, i) => (
												<button
													key={i}
													onClick={() => scrollTo(i)}
													className={`relative flex-shrink-0 overflow-hidden rounded-md ${
														i === activeIndex ? 'ring-2 ring-primary' : ''
													}`}
												>
													<div className="relative size-16 sm:size-20">
														<img
															src={image.src}
															alt={image.alt}
															className="object-cover h-full w-full flex items-center justify-center text-xl"
														/>
													</div>
												</button>
											))}
										</div>
										<ScrollBar orientation="horizontal" />
									</ScrollArea>
									<div className="flex items-center justify-between gap-4 mt-6">
										<CarouselPrevious className="relative left-0 right-auto" />
										<CarouselNext className="relative left-0 right-auto" />
									</div>
								</Carousel>
							</div>

							<div className="flex flex-col justify-between">
								<div>
									<div className="flex flex-col gap-2">
										<h1 className="text-2xl font-bold">
											{form.watch('name') || 'New Product'}
										</h1>

										<div className="flex items-center mb-4">
											{[...Array(5)].map((_, i) => (
												<Star key={i} className={`size-5 text-gray-400`} />
											))}
											<span className="ml-2 text-lg">0.0</span>
										</div>
									</div>
									<div className="text-2xl font-bold mb-2 mt-4 flex flex-col items-start">
										{discount > 0 && (
											<Badge className="mb-2 bg-red-600">{discount}% OFF</Badge>
										)}
										{form.watch('sale_price') ? (
											<div>
												<span className="text-red-700 mr-2">
													{formatCurrency(Number(form.watch('sale_price')))}
												</span>
												<span className="text-gray-500 line-through text-lg">
													{formatCurrency(Number(form.watch('price')))}
												</span>
											</div>
										) : (
											formatCurrency(Number(form.watch('price')))
										)}
									</div>
									<div className="mb-4">
										{form.watch('stock_quantity') === 0 ? (
											<div className="text-gray-500 flex items-center">
												<CircleX className="mr-1 p-1" />
												Currently unavailable
											</div>
										) : form.watch('stock_quantity') < 6 ? (
											<div className="text-orange-600 flex items-center">
												<CircleCheck className="mr-1 p-1" />
												{form.watch('stock_quantity')} in stock
											</div>
										) : (
											<div className="text-green-600 flex items-center">
												<CircleCheck className="mr-1 p-1" />
												{form.watch('stock_quantity')} In stock
											</div>
										)}
									</div>
								</div>
								<div className="flex flex-col gap-4 mt-6">
									{form.watch('purchase_note') && (
										<p className="text-gray-600 dark:text-gray-400 text-sm mt-4">
											{form.watch('purchase_note')}
										</p>
									)}
									<div>
										<div className="flex flex-col lg:flex-row gap-4">
											<Button variant="outline" className="w-full">
												Add to Cart
											</Button>
											<div className="flex gap-4 w-full">
												<Button className="w-full">Buy Now</Button>
												<Button className="px-2">
													<Heart />
												</Button>
											</div>
										</div>
									</div>
									{form.watch('purchasable') ? null : (
										<p className="text-sm text-gray-700 dark:text-gray-300">
											⚠️ Currently not purchasable.
										</p>
									)}
								</div>
							</div>
						</div>

						<Accordion
							type="single"
							defaultValue="description"
							collapsible
							className="mt-8"
						>
							<AccordionItem value="description">
								<AccordionTrigger>Description</AccordionTrigger>
								<AccordionContent>
									<div
										className="prose dark:prose-invert max-w-none [overflow-wrap:anywhere]"
										dangerouslySetInnerHTML={{
											__html: form.watch('description') || 'Lorem Ipsum',
										}}
									/>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
						{form.watch('reviews_allowed') ? (
							<Accordion
								type="single"
								defaultValue="reviews"
								collapsible
								className="mt-8"
							>
								<AccordionItem value="reviews">
									<AccordionTrigger>
										<h1 className="text-xl font-bold">Reviews</h1>
									</AccordionTrigger>
									<AccordionContent className="w-full">
										<div className="flex gap-4 items-center justify-between mb-4">
											<div className="flex items-center gap-4">
												<div className="flex items-center">
													{[...Array(5)].map((_, i) => (
														<Star key={i} className={`size-5 text-gray-400`} />
													))}
													<span className="ml-2 text-lg">0.0</span>
												</div>
											</div>
											<Button size={'sm'} variant={'outline'}>
												Write a Review
											</Button>
										</div>
										<div>There are currently no reviews on this product yet.</div>
									</AccordionContent>
								</AccordionItem>
							</Accordion>
						) : (
							<Accordion
								type="single"
								defaultValue="reviews"
								collapsible
								className="mt-8"
							>
								<AccordionItem value="reviews">
									<AccordionTrigger>
										<h1 className="text-xl font-bold">Reviews</h1>
									</AccordionTrigger>
									<AccordionContent>
										<Carousel className="w-full">
											<CarouselContent className="pl-4">
												⚠️ Reviews are currently not allowed on this product.
											</CarouselContent>
										</Carousel>
									</AccordionContent>
								</AccordionItem>
							</Accordion>
						)}
					</ScrollArea>
				</TabsContent>
			</Tabs>
		</div>
	)
}
